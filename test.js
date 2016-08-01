//Uncache the auth module
require.uncache = function (moduleName) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    require.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName)>0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
};

require.searchCache = function (moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function run(mod) {
            // Go over each of the module's children and
            // run over it
            mod.children.forEach(function (child) { run(child); });

            // Call the specified callback providing the
            // found module
            callback(mod);
        })(mod);
    }
};

var chai = require('chai');
var rethinkdbdash = require('rethinkdbdash');

var rethinkConfig = require("./index.js");
var expect = chai.expect;

describe("Rethink Config", function() {
  var r = rethinkdbdash()
  afterEach(function(done){
    r.dbDrop("RethinkConfig").run().then(function(response){
      done();
    });
  });
  it("Should create a test database", function(done) {
    this.timeout(15000);

    rethinkConfig(r, {
      "database": "RethinkConfig"
    }, function(err) {
      if (err) throw err

      r.dbList().run().then(function(response){
        expect(response).to.contain('RethinkConfig');
        done();
      })
    });
  })
  it("Should create tables", function(done) {
    this.timeout(15000);

    rethinkConfig(r, {
      //Specify the database
      "database": "RethinkConfig",
      //Specify your tables in an array.
      "tables": [
        "One",
        "Three"]
    }, function(err) {
      if (err) throw err
      r.db("RethinkConfig")
      .tableList()
      .run()
      .then(function(response) {
        expect(response).to.contain('One');
        expect(response).not.to.contain('Two');
        expect(response).to.contain('Three');
        done();
      })
    })
  })
  it("Should create tables with options", function(done) {
    this.timeout(15000);

    rethinkConfig(r, {
      //Specify the database
      "database": "RethinkConfig",
      //Specify your tables in an array.
      "tables": [
        { table:"Two", primaryKey:"twoId" }
        ]
    }, function(err) {
      if (err) throw err
      r.db("RethinkConfig")
      .table("Two")
      .config()
      .run()
      .then(function(response) {
        expect(response.primary_key).to.equal('twoId');
        done();
      });
    });
  })
  it("Should create indexes", function(done) {
    this.timeout(15000);

    rethinkConfig(r, {
      //Specify the database
      "database": "RethinkConfig",
      //Specify your tables in an array.
      "tables": [
        "One",
        "Three"],
        "indexes": [
          {
            "table": "One",
            "index": "IndexOne"
          },
          {
            "table": "One",
            "index": "IndexTwo"
          }
        ]
    }, function(err) {
      if (err) throw err
      r.db("RethinkConfig")
      .table("One")
      .indexList()
      .run()
      .then(function(response) {
        expect(response).to.contain('IndexOne');
        expect(response).to.contain('IndexTwo');
        done();
      })
    })
  })
  it.only("Should create a arbitrary expression index", function(done) {
    this.timeout(15000);
    rethinkConfig(r, {
      //Specify the database
      "database": "RethinkConfig",
      //Specify your tables in an array.
      "tables": [
        "One",
        "Three"],
        "indexes": [
          {
            "table": "One",
            "index": "IndexOne",
            "expr": r.add(r.row("last_name"), "_", r.row("first_name")),
          }
        ]
    }, function(err) {
      if (err) throw err
      r.db("RethinkConfig")
      .table("One")
      .indexStatus("IndexOne")
      .run()
      .then(function(response) {
        expect(response[0].query).to.contain('r.add(r.row("last_name"), "_", r.row("first_name"))');
        done();
      })
    })
  })
  it("Should not overwrite existing database", function(done) {
    this.timeout(15000);

    rethinkConfig(r, {
      "database": "RethinkConfig",
      "tables": ["One"]
    }, function(err) {
      if (err) throw err
      rethinkConfig(r, {
        "database": "RethinkConfig",
        "tables": ["Two"]
      }, function(err) {
        if (err) throw err
        r.db("RethinkConfig")
        .tableList()
        .run()
        .then(function(response) {
          expect(response).to.contain('One');
          expect(response).to.contain('Two');
          done();
        });
      });
    });
  })
  it("Should not overwrite existing table", function(done) {
    this.timeout(15000);

    rethinkConfig(r, {
      "database": "RethinkConfig",
      "tables": [
        { table:"Two", primaryKey:"twoId" }
        ]
    }, function(err) {
      if (err) throw err
      rethinkConfig(r, {
        "database": "RethinkConfig",
        "tables": [
          { table:"Two", primaryKey:"OtherId" }
          ]
      }, function(err) {
        if (err) throw err
        r.db("RethinkConfig")
        .table("Two")
        .config()
        .run()
        .then(function(response) {
          expect(response.primary_key).to.equal('twoId');
          done();
        });
      });
    });
  })
  it("Should not overwrite existing index", function(done) {
    this.timeout(15000);

    rethinkConfig(r, {
      "database": "RethinkConfig",
      "tables": [
        "One",
        "Three"],
        "indexes": [
          {
            "table": "One",
            "index": "IndexOne"
          },
          {
            "table": "One",
            "index": "IndexTwo"
          }
        ]
    }, function(err) {
      if (err) throw err
      rethinkConfig(r, {
        "database": "RethinkConfig",
        "tables": [
          "One",
          "Three"],
          "indexes": [
            {
              "table": "One",
              "index": "IndexOne"
            },
            {
              "table": "One",
              "index": "IndexTwo"
            }
          ]
      }, function(err) {
        if (err) throw err
        r.db("RethinkConfig")
        .table("One")
        .indexList()
        .run()
        .then(function(response) {
          expect(response).to.contain('IndexOne');
          expect(response).to.contain('IndexTwo');
          done();
        });
      });
    });
  })
})
