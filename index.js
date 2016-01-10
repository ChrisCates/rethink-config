var r, async = require('async');

module.exports = function(config) {
  if (!config) throw 'Must supply a config.';
  if (!config.database) throw 'Must supply a database';

  r = require('rethinkdbdash')(config.setup);

  async.series([
    function(callback) {
      r.dbList().contains(config.database)
      .then(function(bool) {
        if (bool == false) {
          r.dbCreate(config.database)
          .then(function() { callback(null); })
          .error(function(err) { callback(err); });
        } else { callback(null); }
      })
    },
    function(callback) {
      if (config.tables) {
        async.each(config.tables, function(table, callback2) {
          r.db(config.database).tableList().contains(table)
          .then(function(bool) {
            if (bool == false) {
              r.db(config.database).tableCreate(table)
              .then(function() { callback2(null); })
              .error(function(err) { callback2(err); });
            } else { callback2(null) }
          })
        }, function(err) {
          callback(null);
        })
      } else {
        callback(null);
      }
    },
    function(callback) {
      if (config.indexes) {
        async.each(config.indexes, function(index, callback2) {
          r.db(config.database).table(index.table).indexList().contains(index.index)
          .then(function(bool) {
            if (bool == false) {
              r.db(config.database).table(index.table).indexCreate(index.index)
              .then(function() { callback2(null); })
              .error(function(err) { callback2(err); });
            } else { callback2(null); }
          })
        })
      } else {
        callback(null);
      }
    }
  ])
}
