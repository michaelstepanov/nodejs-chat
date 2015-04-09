var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000; // This is needed if the app is run on heroku

require('./config')(app, io);
require('./routes')(app, io);

http.listen(port, function(){
    console.log('Listening on *:' + port);
});