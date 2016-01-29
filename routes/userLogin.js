/**
 * Created by anmol on 14/1/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../Controllers/userController');

/*
{
response:{
message:"",
data:{tweets:[]}
},
statusCode:200/201/400
}
*/
var loginRoute = {
    method:'POST',
    path:'/v1/Login/',
    handler : function(request,reply) {
        controller.userLoginLogic(request.payload.name, request.payload.password, function (err, result) {
            if (err)
                reply(err)
            else
                reply('Logged in').header('loginToken',result)
        })
    },
    config:{
        tags:['api','Login'],
        validate:{
            payload:{
                name : Joi.string().required().description("USERNAME"),
                password : Joi.string().required().description("PASSWORD")
            }
        },
        plugins:{
            'hapi-swagger':{
            payloadType:"form"
        }}

    }
}

module.exports = [
 loginRoute
]