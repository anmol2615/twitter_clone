'use strict';

var Joi = require('joi'),
    controller = require('../Controllers/userController');

var userTweet = {
    method : 'GET',
    path : '/Tweet/{tweet}/{visibility}',
    handler : function(request,reply) {
        controller.tweetLogic(request.headers.auth,request.params.tweet,request.params.visibility,
            function(err,result){
            if(err)
            reply(err)
            else
            reply(request.params.tweet)
        })
    },
    config : {
        tags : ['api'],
        validate : {
            headers : Joi.object({
                auth : Joi.string().required()
            }).options({ allowUnknown: true }),
            params: {
                tweet: Joi.string().min(1).max(160).required(),
                visibility : Joi.allow('Public','Private').required()
            }
        }
    }
}

module.exports = [
    userTweet
]