# gitdb
A simple, robust and performant git-based database 

# API (Work In Progress)

```js
const gitdb = require('gitdb');

const config = {
  cache: string, // allowed values: null, 'memory'. Defaults to 'memory'
  autoCommit: bool // defaults to false
  autoPush: false | { // autopush to remote on commit, post-MVP
    remote: string,
    branch: string
  }
}

const db = gitdb.init(:config);

db.create(:collectionName)
db.delete(:collectionName)
db.list() // list collections
db.commit() // commit staged changes 
db.rollback() // revert staged changes
/**
* Read either single or all collections from disk
*/
db.flush(:collectionName) // flush cache and read entire collection, applicable if cache is enabled    
const collection = db.collection(:collectionName);
collection.insert(:data);
collection.upsert({}: where, {$set: {}} | function);
collection.size();
collection.delete({}: where);
collection.update({}: where, function(row) { return updatedRowData; });


collection.find().sort().limit()
```
