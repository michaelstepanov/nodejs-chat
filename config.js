// This file handles the configuration of the app.
// It is required by app.js

var express = require('express');
var bodyParser = require('body-parser');

module.exports = function(app, io){

    // Set .jade as the default template extension
    app.set('view engine', 'jade');

    // Initialize the jade template engine
    app.engine('html', require('jade').renderFile);

    // Tell express where it can find the templates
    app.set('views', __dirname + '/views');

    // Make the files in the public folder available to the world
    app.use(express.static(__dirname + '/public'));

    // To support JSON-encoded bodies
    app.use(bodyParser.json());

    // To support URL-encoded bodies
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Add headers
    app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    });
};