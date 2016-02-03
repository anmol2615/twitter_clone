'use strict';

var Joi = require('joi'),
    controller = require('../Controllers/userController');

var follow = {
    method : 'PUT',
    path : '/Follow',
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
        plugins:{
            'hapi-swagger':{
                payloadType:"form"
            }}
    }
}

var unfollow = {
    method : 'PUT',
    path : '/unfollow',
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
        plugins:{
            'hapi-swagger':{
                payloadType:"form"
            }}
    }
}
module.exports = [
    follow,
    unfollow
];