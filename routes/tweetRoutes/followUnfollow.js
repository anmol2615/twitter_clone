'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/userController');

var follow = {
    method : 'PUT',
    path : '/API/v1/twitter/Follow',
    handler : function(request,reply) {
        controller.followSomeoneLogic(request.payload.auth,request.payload.name,function(err,result){
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
                auth: Joi.string().required(),
                name: Joi.string().required()
            }
        },
        response : {
            options : {
                allowUnknown : true
            },
            schema : {
                message : Joi.string().required(),
                data : Joi.string()
            }
        }
    }
}

var unfollow = {
    method : 'PUT',
    path : '/user/unfollow',
    handler : function(request,reply) {
        controller.unfollowSomeoneLogic(request.payload.auth,request.payload.name,function(err,result){
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
                auth: Joi.string().required(),
                name: Joi.string().required()
            }
        },
        response : {
            options : {
                allowUnknown : true
            },
            schema : {
                message : Joi.string().required(),
                data : Joi.string()
            }
        }
    }
}
module.exports = [
    follow,
    unfollow
];