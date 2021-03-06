/**
 * Created by anmol on 3/2/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/adminController');

var adminLoginRoute = {
    method:'POST',
    path:'/API/v1/admin/Login',
    handler : function(request,reply) {
        controller.adminLoginLogic(request.payload.name, request.payload.password, function (err, result) {
            if(err)
            {
                reply(err.response).code(err.statusCode);
            }
            else
            {
                reply(result.response).header("token",result.response.data).code(result.statusCode);
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
                message : Joi.string().required()
            }
        }

    }
}

module.exports = [
    adminLoginRoute
]