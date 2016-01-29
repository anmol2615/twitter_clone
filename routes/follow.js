'use strict';

var Joi = require('joi'),
    controller = require('../Controllers/userController');

var follow = {
    method : 'GET',
    path : '/Follow',
    handler : function(request,reply) {
        controller.followSomeoneLogic(request.params.auth,request.params.name,function(err,result){
            if(err)
                reply(err)
            else
                reply('You are now following'+request.params.name)
        })
    },
    config : {
        tags : ['api'],
        validate : {
            params: {
                auth: Joi.string().required(),
                name: Joi.string().required()
            }
        }
    }
}

module.exports = [
    follow
]