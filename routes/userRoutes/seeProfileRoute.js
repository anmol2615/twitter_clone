/**
 * Created by anmol on 3/2/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/userController');

var seeProfileRoute = {
    method : 'GET',
    path : '/API/v1/user/seeProfile/{name}',
    handler : function(request,reply) {
        controller.seeProfile(request.headers.auth,request.params.name,
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
            params: {
                name: Joi.string()
            }
        },
        response : {
            options : {
                allowUnknown : true
            },
            schema : {
                message : Joi.string().required(),
                data : Joi.object().keys({
                    USER_DETAILS : Joi.object().keys({
                        _id : Joi.any(),
                        following : Joi.array(),
                        followers : Joi.array(),
                        noOfFollowing : Joi.number(),
                        noOfFollowers : Joi.number()
                    }),
                    TWEETS : Joi.array().items(
                       Joi.object().keys({
                           id : Joi.any(),
                           tweet : Joi.string(),
                           timestamp : Joi.date()
                       })
                    )
                })
            }
        }

    }
};

module.exports = [
    seeProfileRoute
]