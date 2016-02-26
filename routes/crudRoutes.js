'use strict';

var arr = [],
    Joi = require('joi'),
    async = require('async'),
    CONFIG = require('../Config'),
    SERVICE = require('../Service'),
    MODEL = require('../Model'),
    controller = require('../Controllers/crudController');

//ROUTE 1
var route1 = {
  method: 'GET',
  path:'/',
  handler: function(request,reply){
    reply('yes');

  }

};

////ROUTE 2
//var route2 = {
//  method: 'GET',
//  path:'/{name}',
//  handler: function (request, reply) {
//
//     return reply('hello ' + encodeURIComponent(request.params.name));
//  },
//  config : {
//    validate : {
//      params : {
//        name : Joi.string().min(5).required()
//      }
//    }
//  }
//
//};

var route3 = {
  method:'POST',
  path:'/v1/sorting/{input}',
  handler : function (request,reply)
        {
          if(CONFIG.USER_DATA.isLoggedIn) {
            controller.sorting(request.payload.id,request.payload.input,function(err, result){
              if(err)
              reply(err)
              else
              reply(result)
            })
          }
          else
          reply('Log in first')
        },

  config:{
    tags:['api','sort'],
    validate:{
      payload:{
        id:Joi.number().required(),
        input:Joi.array().required().description("input"),
      }
    }

  }
};

var route4 = {
  method: 'GET',
  path: '/v1/Searching',
  handler: function (request, reply) {
    if(CONFIG.USER_DATA.isLoggedIn) {
      controller.search(request.params.element,function(err,result){
        if(err)
        reply(err)
        else
        reply(result)
      })
    }
    else
    reply('Login first');
  },
  config: {
    description: 'Get request',
    tags: ['api', 'search'],
    validate: {
      query: {
        element: Joi.number().required()
      }
    }
  }
};

var route5 = {
  method : 'DELETE',
  path : '/v1/deletion',
  handler : function(request,reply) {
    if (CONFIG.USER_DATA.isLoggedIn) {
      controller.deletion(request.payload.id,request.payload.num,function(err, result){
        if(err)
        reply(err)
        else
        reply(result)
      })
    }
    else
    reply('login First')
    },
    config:{
      tags : ['api'],
      validate:
      {
        payload:{
          id:Joi.number().required(),
          num: Joi.number().required()
        }
      }
    }
};

var route6 = {
  method : 'PUT',
  path : '/v1/concatenation/',
  handler : function(request,reply)
  {
    if(CONFIG.USER_DATA.isLoggedIn) {
      controller.concatenation(request.payload.id,request.payload.arr2,function(err, result){
        if(err)
        reply(err)
        else
        reply(result)
      })
    }
    else
    reply ('Login first')
  },
  config:{

    tags : ['api','concatenate'],
    validate:{
      payload:{
        id : Joi.number().required(),
        arr2:Joi.array().required().description('2nd array')

      }
    }
  }
};

module.exports=[route1,route3,route4,route5,route6]