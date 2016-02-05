/**
 * Created by anmol on 4/2/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/adminController');

var deleteTweetRoute = {
    method : 'DELETE',
    path : '/admin/deleteTweet',
    handler : function(request,reply) {
        controller.deleteTweet(request.payload.auth,request.payload.tweetId,
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
                tweetId: Joi.string().required()
            }
        }
    }
};

module.exports = [
    deleteTweetRoute
]