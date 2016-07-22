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

describe("Rethink Config", function() {

  var r = require("rethinkdbdash")()

  it("Should create a test database", function(done) {
    this.timeout(5000);

    require("./index.js")(r, {
      //Specify the database
      "database": "RethinkConfig",
      //Specify your tables in an array.
      "tables": ["One", "Two", "Three"],
      //Specify your indexes in an array
      "indexes": [
        //Each index needs to be specified a table and an index.
        {
          "table": "One",
          "index": "IndexOne"
        },
        {
          "table": "One",
          "index": "IndexTwo"
        },
        {
          "table": "Two",
          "index": "IndexOne"
        }
      ]
    }, function(err) {
      if (err) throw err
      done()
    })
  })

  it("Should not overwrite existing database", function(done) {
    this.timeout(5000);

    require.uncache("./index.js")

    require("./index.js")(r, {
      //Specify the database
      "database": "RethinkConfig",
      //Specify your tables in an array.
      "tables": ["One", "Two", "Three"],
      //Specify your indexes in an array
      "indexes": [
        //Each index needs to be specified a table and an index.
        {
          "table": "One",
          "index": "IndexOne"
        },
        {
          "table": "One",
          "index": "IndexTwo"
        },
        {
          "table": "Two",
          "index": "IndexOne"
        }
      ]
    }, function(err) {
      if (err) throw err
      done()
    })
  })

})
