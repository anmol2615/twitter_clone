/**
 * Created by anmol on 5/2/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/adminController');

var deleteTweetRoute = {
    method : 'DELETE',
    path : '/admin/deleteUser',
    handler : function(request,reply) {
        controller.deleteUser(request.payload.auth,request.payload.name,
            function(err,result){
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
    config : {
        tags : ['api'],
        validate : {
            payload: {
                auth : Joi.string().required(),
                name: Joi.string().required()
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
};

module.exports = [
    deleteTweetRoute
];