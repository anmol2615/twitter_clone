'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/userController');

var userTweet = {
    method : 'POST',
    path : '/API/v1/twitter/Tweet',
    handler : function(request,reply) {
        controller.tweetLogic(request.headers.auth,request.payload.tweet,request.payload.visibility,
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
            headers : Joi.object({
                auth : Joi.string().required()
            }).options({ allowUnknown: true }),
            payload: {
                tweet: Joi.string().min(1).max(160).required(),
                visibility : Joi.allow('Public','Private')
            }
            //,
            //failAction :{ function(request,reply,source,error){
            //    console.log('hello');
            //}
            //}
        },
        response : {
            options : {
                allowUnknown : true
            },
            schema : {
                message : Joi.string().required(),
                data : Joi.object().keys({
                    tweet_id : Joi.any(),
                    tweet : Joi.string()
                })
            }
        }

    }
}

module.exports = [
    userTweet
]