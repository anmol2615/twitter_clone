'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/userController');

var registerRoute = {
    method:'POST',
    path:'/v1/register',
    handler : function (request,reply)
    {
        controller.userRegistrationLogic(request.payload.name , request.payload.password,request.payload.email,request.payload.phoneNo,function(err,result){
            if(err)
            reply(err.response).code(error.statusCode);
            else
            reply(result.response).code(result.statusCode);
        });
    },
    config:{
        tags:['api','register'],
        validate:{
            payload:{
                name : Joi.string().required(),
                email : Joi.string().required(),
                password : Joi.string().required(),
                phoneNo : Joi.string().required()

            }
        },
        plugins:{
            'hapi-swagger':{
                payloadType:"form"
            }},
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
          {
              reply(err.response).code(err.statusCode);
          }
          else
          {
              reply(result.response).code(result.statusCode);
          }
      })
    }
};
module.exports = [
     registerRoute,
     clickToVerify
]