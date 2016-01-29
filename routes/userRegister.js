'use strict';

var Joi = require('joi'),
    controller = require('../Controllers/userController');

var registerRoute = {
    method:'POST',
    path:'/v1/register/{name}/{email}/{password}/{phoneNo}',
    handler : function (request,reply)
    {
        controller.saveUser(request.params.name , request.params.password,request.params.email,request.params.phoneNo,function(err,result){
            if(err)
            reply(err)
            else
            reply('You are now registered')
        });
    },
    config:{
        tags:['api','register'],
        validate:{
            params:{
                name : Joi.string().required().description("USERNAME"),
                email : Joi.string().required().description('Email'),
                password : Joi.string().required().description("PASSWORD"),
                phoneNo : Joi.string().required().description('Contact no.')

            }
        }
    }
};
var clickToVerify = {
    method : 'GET',
    path : '/verify_email_link/{token}',
    handler : function(request,reply)
    {
      controller.clickToVerify(request.params.token,function(err,result)
      {
          if(err)
          reply(err)
          else
          reply(result)
      })
    }
}
module.exports = [
     registerRoute,
     clickToVerify
]