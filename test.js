var rethinkConfig = require ('./index');

rethinkConfig({
  //Specify the database
  "database": "Hello",
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
})
