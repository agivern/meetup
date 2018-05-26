'use strict';

const express = require('express');
const bodyParser= require('body-parser')

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const DATABASE_URL = 'mongodb://meetup_mongodb:27017';
const DATABASE_NAME = 'meetup-dev';
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

// App
const app = express();
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res) => {
    res.send('Root api !');
});

// Events
app.get('/events/:id', (req, res) => {
    var id = ObjectId(req.params.id);

    db.collection('events').find({'_id': id}).toArray(function(err, results) {
        if (err) {
            return console.log(err);
        }
        res.send(results);
    });
});

app.post('/events', (req, res) => {
    db.collection('events').save(req.body, (err, result) => {
        if (err) {
            return console.log(err);
        }
        var documentInserted = result['ops'][0];
        res.location('/events/' + documentInserted._id);
        res.send(201, null);
    })
})

// Connect to the DB and start to listen
var db;

MongoClient.connect(DATABASE_URL, (err, client) => {
    if (err) {
       return console.log(err);
    }
    db = client.db(DATABASE_NAME);
    app.listen(PORT, HOST);
})
