var log = module.exports = exports = new MoncacheLog;

function MoncacheLog() {
  this.cache = false;
}

MoncacheLog.prototype.init = function(cache, debug) {
  var log = debug ? console.log : function() {};

  return {
    read: function(key, value) {
      if(!value) {
        return log('[mon-cache] get ' + cache.store + ' # key: ', key + ' / miss!');
      }
      if (cache.store == 'redis') {
        cache.client.ttl(key, function(err, ttl) {
          log('[mon-cache] get ' + cache.store + ' # key: ', key + ' / ttl: ' + ttl);
        });
      } else {
        log('[mon-cache] get ' + cache.store + ' # key: ', key);
      }
    },
    write: function(key, ttl) {
      log('[mon-cache] set ' + cache.store + ' # key: ', key + ' / ttl: ' + ttl);
    },
    info: function(tag, str) {
      log('[mon-cache] info ' + tag + ' # ' + str);
    },
    error: function(err) {
      log(err);
    }
  };
};
