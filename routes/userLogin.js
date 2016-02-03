/**
 * Created by anmol on 14/1/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../Controllers/userController');

var loginRoute = {
    method:'POST',
    path:'/v1/Login',
    handler : function(request,reply) {
        controller.userLoginLogic(request.payload.name, request.payload.password, function (err, result) {
            if(err)
            {
                reply(err.response).code(err.statusCode);
            }
            else
            {
                reply(result.response).code(result.statusCode);
            }
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