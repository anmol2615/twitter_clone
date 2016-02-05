'use strict';

const Joi = require('joi');
var controller = require('../../Controllers/userController');

var displayTweets = {
    method:'GET',
    path:'/Display_Tweets/{auth}/{field}',
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
        plugins:{
            'hapi-swagger':{
                payloadType:"form"
            }}
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