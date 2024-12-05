//Author: Nnamdi Nwanze
//Description: This database manager demonstrates the use of database operations including creating/deleting collections and inserting, searching and updating entries.
const config = require('./config.json');

const mycollection = config.mycollection;
const myDB = config.myDB;
var myMongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://"+config.username+":" + config.pwd +"@cluster0.yjzs4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";


//set up the database
exports.setup = function () {
    let cbackfunc;
    testConnection(cbackfunc);
    createMyCollection(cbackfunc);
};
//create the database
let testConnection = function (callbackFn) {
    console.log("Attempting connection to database...");
    myMongoClient.connect(url)
    .then(db => {
        console.log("Connected to database!");
        db.close();
    })
    .catch(function (err) {
        throw err;
    })
};

//creates collection
let createMyCollection = function (callbackFn) {
    if (!myDB) {
        console.log("ERROR: Collection undefind. Fix myDB in config file");
        return;
    }
    myMongoClient.connect(url)
    .then(db => {
      var dbo = db.db(myDB);
      dbo.createCollection(mycollection)
      .then(()=>{
        console.log("Collection created!");
        db.close();
      })
    })
    .catch(function (err) {
        throw err;
    })
};

//inserts a record of myobj into the database
exports.insertRec = function (myobj, callbackFn) {
    myMongoClient.connect(url)
    .then(db => {
        var dbo = db.db(myDB);
        dbo.collection(mycollection).insertOne(myobj)
        .then(result => {
            console.log("1 document inserted");
            if (callbackFn) callbackFn(null); // Call callback with no error
            db.close();
        })
        .catch(error => {
            console.error("Error inserting document:", error);
            if (callbackFn) callbackFn(error);
            db.close();
        });
    })
    .catch(error => {
        console.error("Error connecting to DB in insertRec:", error);
        if (callbackFn) callbackFn(error);
    });
};

//finds a single record with information contained in data
exports.findRec = function (data, callbackFn) {
    myMongoClient.connect(url)
    .then(db => { 
      var dbo = db.db(myDB);
      dbo.collection(mycollection).findOne(data)
      .then(results => {
        console.log("Results:", results);  // Add this for debugging
        callbackFn(results);  // Call the callback with the result
        db.close();
      })
      .catch(function (err) {
        console.log("Error in findRec:", err);  // Log any errors
        callbackFn(null);  // Ensure callback is always called with null if error
      });
    })
    .catch(function (err) {
        console.log("Error in DB connection:", err);  // Log any connection errors
        callbackFn(null);  // Ensure callback is always called with null if error
    });
};


//finds all records using a limit (if limit is 0 all records are returned)
exports.findAll = function (limit, callbackFn) {
    myMongoClient.connect(url)
    .then(db => { 
        var dbo = db.db(myDB);
        dbo.collection(mycollection).find({}).limit(limit || 0).toArray()
        .then(results => {
            console.log("Results:", results);
            if (typeof callbackFn === 'function') {
                callbackFn(results);
            }
            db.close();
        })
        .catch(error => {
            console.error("Error in findAll query:", error);
            if (typeof callbackFn === 'function') {
                callbackFn(null);
            }
            db.close();
        });
    })
    .catch(error => {
        console.error("Error connecting to DB in findAll:", error);
        if (typeof callbackFn === 'function') {
            callbackFn(null);
        }
    });
};

//deletes a collection
exports.deleteCollection = function (callbackFn) {
    myMongoClient.connect(url)
    .then(db => { 
      var dbo = db.db(myDB);
      dbo.collection(mycollection).drop()
      .then(isDeleted=>{
        if (isDeleted)
            console.log("Collection deleted");
        db.close();
      })
    })
    .catch(function (err) {
        throw err;
    })
};

//updates queryData's data in the database to newdata
exports.updateData = function (queryData, newdata, callbackFn) {
    myMongoClient.connect(url)
        .then(db => {
            var dbo = db.db(myDB);
            // Perform the update operation
            dbo.collection(mycollection).updateOne(queryData, { $set: newdata })
                .then(result => {
                    if (result.matchedCount === 0) {
                        console.log("No documents matched the query. No updates made.");
                        callbackFn(null, "No documents updated");
                    } else {
                        callbackFn(null, "1 document updated");
                    }
                    db.close();
                })
                .catch(err => {
                    console.error("Error during update:", err);
                    callbackFn(err, null);
                    db.close();
                });
        })
        .catch(err => {
            console.error("Database connection failed:", err);
            callbackFn(err, null);
        });
};


exports.testConnection = testConnection;
