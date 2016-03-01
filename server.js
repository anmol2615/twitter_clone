'use strict';

const Plugins = require('./Plugins');
const Hapi = require('hapi');
var Routes=require('./routes');
var CONFIG = require('./Config');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var dbConnection = require('./Model/dbConnection');
const server = new Hapi.Server();

var PORT = CONFIG.SERVERCONFIG.PORT.LIVE;

//------------------------------------------------
if (process.env.NODE_ENV === 'TEST') {
  PORT = CONFIG.SERVERCONFIG.PORT.TEST;
} else if (process.env.NODE_ENV === 'DEV') {
  PORT = CONFIG.SERVERCONFIG.PORT.DEV;
}

// Create a server with a host and port
server.connection({
  port: PORT
});

//------------------------------------------------------
server.register(Plugins, function (err) {
  if (err) {
    server.error('Error while loading Plugins : ' + err)
  } else {
    server.log('info', 'Plugins Loaded')
  }
});

//------------------------------------------------------
var io = require('socket.io')(server.listener);
io.on('connection', function (socket) {
  socket.on('chat message',function(msg){
    io.emit('chat message',msg);
  });
});
//------------------------------------------------------
Routes.forEach(function(apis){
  server.route(apis);
});
server.start(function () {
  server.log('Server running at:', server.info.uri);
});