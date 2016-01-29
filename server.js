'use strict';

const Plugins = require('./Plugins');
const Hapi = require('hapi');
var Routes=require('./routes');
var CONFIG = require('./Config');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var schema = require('./Model/dbConnection');
const server = new Hapi.Server();

//------------------------------------------------
//console.log(schema);
// Create a server with a host and port
server.connection({
  host: 'localhost',
  port: CONFIG.SERVERCONFIG.PORT.LIVE
});


//--------------------------------------------------

server.register(Plugins, function (err) {
  if (err) {
    server.error('Error while loading Plugins : ' + err)
  } else {
    server.log('info', 'Plugins Loaded')
  }
});

//------------------------------------------------------

Routes.forEach(function(apis){
  server.route(apis);
});
server.start(function () {
  server.log('Server running at:', server.info.uri);
});