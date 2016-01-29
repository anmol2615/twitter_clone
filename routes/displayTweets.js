'use strict';

const Joi = require('joi');
var controller = require('../Controllers/userController');

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
        }
    },
    handler:function(request,reply)
    {
        controller.displayTweets(request.params.auth,request.params.field,function(err,result){
            if(err)
            {
                reply(err)
            }
            else
            {
                reply(result);
            }
        })
    }
}

module.exports = [
    displayTweets
];