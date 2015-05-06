var cache = require('cache-client'),
    async = require('async');

module.exports = function(mongoose, options) {
  // set options to mon-cashe
  options = options || {};
  options.store = options.store || 'memory';
  options.ttl = options.ttl || 60;

  cache.setup(options); // init cache
  var log = require('./log').init(cache, options.debug);

  if (options.store == 'redis' && options.select_db) {
    cache.client.select(options.select_db, function(err) {
      if (err) {
        log.error(err);
      } else {
        log.info('redis', 'select db: ' + options.select_db);
      }
    });
  }

  var exec = function(caller, args) {
    var self = this;
    if (!self.__cached) {
      return methods[caller].apply(this, args);
    }

    // generate key from mongoose query
    var key = self.__key || require('./key').generate(self);

    async.waterfall(
        [
         // read from cache
         function(callback) {
           cache.read(key, function(value) {
             log.read(key, value);
             callback(undefined, value);
           });
         },
         function(value, callback) {
           if (value != null) {    // is Hit?
             // attach fromCache flag
             if (value) {
               if (value instanceof Array) {
                 for (var i in value) {
                   value[i].fromCache = true;
                 }
               } else {
                 value.fromCache = true;
               }
             }

             for (var i in args) {
               if (typeof args[i] === 'function') {
                 args[i](null, value);
                 break;
               }
             }
             return self;  // done
           } else {        // miss
             callback();
           }
         },
         function(callback) {
           for (var i in args) {
             if (typeof args[i] !== 'function') {
               continue;
             }
             args[i] = (set).bind(args[i]);  // cache
           }
           callback(null, methods[caller].apply(self, args));
         }
        ],
        function(err, result) { // Always, err is undefined.
          return result;
        }
    );

    function set(err, obj) {
      if (err) {
        log.error(err);
      } else {
        log.write(key, self.__ttl || options.ttl);
        cache.write(key, obj, self.__ttl || options.ttl);
      }
      this.apply(this, arguments);
    }
  };

  var methods = {
    exec: mongoose.Query.prototype.exec,
    execFind: mongoose.Query.prototype.execFind
  };

  mongoose.Query.prototype.cache = function(arg0, arg1, arg2) {
    this.__options = options;
    this.__cached = options.cache == false ? false : (typeof arg0 === 'boolean' ? arg0 : true);
    this.__ttl = typeof arg0 === 'number' ? arg0 : (typeof arg1 === 'number' ? arg1 : options.ttl);
    this.__key= typeof arg0 === 'string' ? arg0 : (typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : undefined));
    return this;
  };

  mongoose.Query.prototype.execFind = function(callback) {
    return exec.call(this, 'execFind', arguments);
  };

  mongoose.Query.prototype.exec = function(callback) {
    return exec.call(this, 'exec', arguments);
  };

  return mongoose;
};

