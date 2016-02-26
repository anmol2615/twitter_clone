/**
 * Created by anmol on 3/2/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/adminController');

var adminLoginRoute = {
    method:'POST',
    path:'/admin/Login',
    handler : function(request,reply) {
        controller.adminLoginLogic(request.payload.name, request.payload.password, function (err, result) {
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
    adminLoginRoute
]