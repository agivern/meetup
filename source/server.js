'use strict';

const express = require('express');
const bodyParser= require('body-parser')

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const DATABASE_URL = 'mongodb://meetup_mongodb:27017';
const DATABASE_NAME = 'meetup-dev';
const MongoClient = require('mongodb').MongoClient;

// App
const app = express();
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res) => {
    res.send('Root api !');
});

var db;

MongoClient.connect(DATABASE_URL, { useNewUrlParser: true }, (err, client) => {
    if (err) {
       return console.log(err);
    }
    db = client.db(DATABASE_NAME);

    require('./events')(app, db, client);

    app.listen(PORT, HOST);
});


