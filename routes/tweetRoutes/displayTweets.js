'use strict';

const Joi = require('joi');
var controller = require('../../Controllers/userController');

var displayTweets = {
    method:'GET',
    path:'/API/v1/twitter/Display_Tweets/{auth}/{field}',
    config:
    {
        tags:['api'],
        validate:{
            params :
            {
                auth : Joi.string().required().description("loginToken"),
                field : Joi.string().required().allow('Ascending','Descending')
            }
        },
        response : {
            options : {
                allowUnknown : true
            },
            schema : {
                message : Joi.string().required(),
                data : Joi.array().items(
                    Joi.object().keys({
                        id : Joi.object().keys({
                            _id : Joi.any(),
                            name : Joi.string()
                        }),
                        tweet : Joi.string(),
                        timestamp : Joi.date()
                    })
                )
            }
        }
    },
    handler:function(request,reply)
    {
        controller.displayTweets(request.params.auth,request.params.field,function(err,result){
            if(err)
            {
                reply(err.response).code(err.statusCode);
            }
            else
            {
                reply(result.response).code(result.statusCode);
            }
        })
    }
}

module.exports = [
    displayTweets
];