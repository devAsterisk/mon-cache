var expect = require('chai').expect,
  cache = require('../lib/mon-cache'),
  mongoose = require('mongoose'),
  SongModel,
  titles = ['Spirit In The Sky', 'I\'m Not In Love', 'Come And Get Your Love', 'Go All The Way',
    'Hooked On A Feeling', 'Escape', 'Moonage Daydream', 'Fooled Around and Fell in Love',
    'Cherry Bomb', 'O-O-H Child', 'Ain\'t No Mountain High Enough', 'I Want You Back'],
  years = [1969, 1975, 1974, 1972, 1974, 1979, 1971, 1976, 1976, 1970, 1967, 1969];

describe('Mon-Cache', function() {
  before(function(done) {
    mongoose.connect('mongodb://127.0.0.1:27017/mon-cache-test');
    cache(mongoose, {ttl: 1});
    SongModel = mongoose.model('Songs', new mongoose.Schema({title: String, year: Number}));
    var songs = [];
    for (var i in titles) {
      songs.push({title: titles[i], year: years[i]});
    }
    SongModel.create(songs, done);
  });

  afterEach(function(done) {
    // wait for cache expire
    setTimeout(function () {
      done();
    }, 1000);
  });

  after(function(done) {
    SongModel.remove({}, function(err) {
      mongoose.disconnect();
      done(err);
    });
  });

  it('should export a function', function() {
    expect(cache).to.be.a('function');
  });

  it('should have cache() method', function() {
    expect(SongModel.find({}).cache).to.be.a('function');
  });

  it('should have default options', function() {
    var query = SongModel.find({}).cache();
    expect(query.__options).to.exist;
    expect(query.__cached).to.be.a('boolean');
    expect(query.__ttl).to.be.an('number');
  });

  it('should not cache if cache() is not called', function(done) {
    SongModel.find({}).cache().exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).exec(function(err, docs) {
        if (err) {
          return done(err);
        } else {
          expect(docs.fromCache).to.not.exist;
          done();
        }
      });
    });
  });

  it('should cache if cache() is called', function(done) {
    SongModel.find({}).cache().exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).cache().exec(function(err, songs) {
        if (err) {
          return done(err);
        } else {
          expect(songs[0].fromCache).to.exist;
          done();
        }
      });
    });
  });

  it('should cache if cache(true) is called', function(done) {
    SongModel.find({}).cache(true).exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).cache(true).exec(function(err, songs) {
        if (err) {
          return done(err);
        } else {
          expect(songs[0].fromCache).to.exist;
          done();
        }
      });
    });
  });

  it('should cache if cache(ttl) is called', function(done) {
    SongModel.find({}).cache(1).exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).cache(1).exec(function(err, songs) {
        if (err) {
          return done(err);
        } else {
          expect(songs[0].fromCache).to.exist;
          done();
        }
      });
    });
  });

  it('should cache if cache(key) is called', function(done) {
    SongModel.find({}).cache('key').exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).cache('key').exec(function(err, songs) {
        if (err) {
          return done(err);
        } else {
          expect(songs[0].fromCache).to.exist;
          done();
        }
      });
    });
  });

  it('should cache if cache(true, ttl) is called', function(done) {
    SongModel.find({}).cache(true, 1).exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).cache(true, 1).exec(function(err, songs) {
        if (err) {
          return done(err);
        } else {
          expect(songs[0].fromCache).to.exist;
          done();
        }
      });
    });
  });

  it('should cache if cache(ttl, key) is called', function(done) {
    SongModel.find({}).cache(1, 'key').exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).cache(1, 'key').exec(function(err, songs) {
        if (err) {
          return done(err);
        } else {
          expect(songs[0].fromCache).to.exist;
          done();
        }
      });
    });
  });

  it('should cache if cache(true, ttl, key) is called', function(done) {
    SongModel.find({}).cache(true, 1, 'key').exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).cache(true, 1, 'key').exec(function(err, songs) {
        if (err) {
          return done(err);
        } else {
          expect(songs[0].fromCache).to.exist;
          done();
        }
      });
    });
  });

  it('should not cache if cache(false) is called', function(done) {
    SongModel.find({}).cache(false).exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).cache(false).exec(function(err, songs) {
        if (err) {
          return done(err);
        } else {
          expect(songs[0].fromCache).to.not.exist;
          done();
        }
      });
    });
  });

  it('should not cache if cache(false, ttl) is called', function(done) {
    SongModel.find({}).cache(false, 1).exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).cache(false, 1).exec(function(err, songs) {
        if (err) {
          return done(err);
        } else {
          expect(songs[0].fromCache).to.not.exist;
          done();
        }
      });
    });
  });

  it('should not cache if cache(false, ttl, key) is called', function(done) {
    SongModel.find({}).cache(false, 1, 'key').exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).cache(false, 1, 'key').exec(function(err, songs) {
        if (err) {
          return done(err);
        } else {
          expect(songs[0].fromCache).to.not.exist;
          done();
        }
      });
    });
  });

  it('should work with lean()', function(done) {
    SongModel.find({}).lean().cache().exec(function(err) {
      if (err) {
        return done(err);
      }
      SongModel.find({}).lean().cache().exec(function(err, songs) {
        if (err) {
          return done(err);
        } else {
          expect(songs[0].fromCache).to.exist;
          done();
        }
      });
    });
  });
});
