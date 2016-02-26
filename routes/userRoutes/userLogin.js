/**
 * Created by anmol on 14/1/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/userController');

var loginRoute = {
    method:'POST',
    path:'/user/Login',
    handler : function(request,reply) {
        controller.userLoginLogic(request.payload, function (err, result) {
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
        response : {
            options : {
                allowUnknown : true
            },
            schema : {
                message : Joi.string().required(),
                data : {}
            }
        }

    }
}

module.exports = [
 loginRoute
]