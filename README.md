# mon-cache
mon-cache is mongoose cache to redis, memcached, or lru-cache.  This utilizes the npm modules cache-client.
<br />

## Initialization

### lru-cache
```javascript
options = {
  store: "memory"
};

require('mon-cache')(mongoose, options);
```

### redis
```javascript
options = {
  store: "redis",
  port:6379,
  host:"127.0.0.1",
  auth:"password",  // optional
  select_db: 0      // optional, default is 0
};

require('mon-cache')(mongoose, options);
```

### memcached
```javascript
options = {
  store: "memcached",
  host:"localhost:11211"
};

require('mon-cache')(mongoose, options);
```

### additional options
```javascript
options = {
  cache: false, // global option to disable caching
  ttl: 60,      // global option to set ttl(sec), default is 60 sec
  debug: true	// print logs for debug
};
```
## Usage

Enable cache with ttl in options.
If you don't set ttl, default ttl is 60 sec.

```javascript
MyModel.find({ ... })
  .cache()
  .exec(function(err, result) { ... });
```
or

```javascript
query.cache(true)      // can explicit enable (or disable) caching
query.cache(10)        // enable caching with 10 sec ttl
query.cache(true, 10)  // enable caching with 10 sec ttl
```

##Contact

* email: asterisk@makeus.com
