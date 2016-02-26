/**
 * Created by anmol on 2/25/16.
 */
'use strict';

const Joi = require('joi');
var controller = require('../../Controllers/userController');

var countTweet = {
    method:'GET',
    path:'/countTweet/{auth}/{field}',
    config:
    {
        tags:['api'],
        validate:{
            headers : Joi.object({
                auth : Joi.string().required()
            }).options({ allowUnknown: true }),
            params:{
                fromDate : Joi.date().format('DD-MM-YYYY').required(),
                toDate : Joi.date().min(Joi.ref('fromDate')).format('DD-MM-YYYY').required()
            }
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
    },
    handler:function(request,reply)
    {
        controller.displayTweetCount(request.headers.auth,request.params,function(err,result){
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
};

module.exports = [
    countTweet
];