/**
 * Created by anmol on 2/15/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/userController');

var likeTweet = {
    method : 'PUT',
    path : '/twitter/like',
    handler : function(request,reply) {
        controller.re_TweetLogic(request.headers.auth,request.payload,
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
                tweetid: Joi.string().required()
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
                data : {}
            }
        }

    }
}

module.exports = [
    likeTweet
]
