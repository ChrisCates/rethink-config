var r, async = require('async');

module.exports = function(r, config,cb) {
  if (!config) throw 'Must supply a config.';
  if (!config.database) throw 'Must supply a database.';

  async.series([
    function(callback) {
      r.dbList().contains(config.database)
      .then(function(bool) {
        if (bool == false) {
          r.dbCreate(config.database)
          .then(function() {
            callback();
          })
        } else {
          callback();
        }
      })
    },
    function(callback) {
      async.each(config.tables, function(table, callback2) {
        r.db(config.database).tableList().contains(table)
        .then(function(bool) {
          if (bool == false) {
            r.db(config.database)
            .tableCreate(table)
            .then(function() {
              callback2()
            })
          } else {
            callback2()
          }
        })
      }, function(err) {
        if (err) callback(err)
        callback()
      })
    },
    function(callback) {
      async.each(config.indexes, function(index, callback2) {
        r.db(config.database).table(index.table).indexList().contains(index.index)
        .then(function(bool) {
          if (bool == false) {
            r.db(config.database)
            .table(index.table)
            .indexCreate(index.index)
            .then(function() {
              callback2()
            })
          } else {
            callback2()
          }
        })
      }, function(err) {
        if (err) callback(err)
        callback()
      })
    }
  ], function(err) {
    cb(err)
  })
}
