var cache = require('cache-client');

module.exports = function(mongoose, options) {
  cache.setup(options); // init cache

  // set options to mon-cashe
  options.ttl = options.ttl || 60;
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
    var key = require('./key').generate(self);

    async.waterfall(
        [
         // read from cache
         function(callback) {
           cache.read(key, function(value) {
             callback(undefined, value);
           });
         },
         function(value, callback) {
           if (value) {    // is Hit?
             log.read(key);
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
        // attach fromCache flag
        if (obj) {
          if (obj instanceof Array) {
            for(var i in obj) {
              obj[i]._doc ? obj[i]._doc.fromCache = true : obj[i].fromCache;
            }
          } else {
            obj._doc ? obj._doc.fromCache = true : obj.fromCache;
          }
        }

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

  mongoose.Query.prototype.cache = function(arg0, arg1) {
    this.__cached = options.cache == false ? false : (typeof arg0 === 'boolean' ? arg0 : true);
    this.__ttl = typeof arg0 === 'number' ? arg0 : (typeof arg1 === 'number' ? arg1 : options.ttl);
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

