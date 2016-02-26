/**
 * Created by anmol on 4/2/16.
 */
'use strict';


var Joi = require('joi'),
    controller = require('../../Controllers/adminController');

var seeUserRoute = {
    method : 'GET',
    path : '/admin/getUser/{name}',
    handler : function(request,reply) {
        controller.seeUserProfile(request.headers.auth,request.params.name,
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
                name: Joi.string().required()
            }
        },
        response : {
            options: {
                allowUnknown: true
            },
            schema: {
                message: Joi.string().required(),
                data: Joi.object().keys({
                    USER_INFO: Joi.object().required().keys({
                        _id : Joi.any(),
                        name : Joi.string(),
                        email : Joi.string(),
                        timeOfRegistration : Joi.date(),
                        phoneNo  : Joi.string(),
                        token : Joi.string(),
                        following : Joi.array(),
                        followers : Joi.array(),
                        isVerifiied : Joi.boolean(),
                        isDeleted : Joi.boolean(),
                        loginToken : Joi.string()
                    }),
                    TWEETS : Joi.array().items(
                        Joi.object().keys({
                            id: Joi.object(),
                            visibility: Joi.string(),
                            isTweetDeleted : Joi.boolean(),
                            tweet : Joi.string(),
                            likedBy : Joi.array(),
                            timestamp : Joi.date(),
                            reTweetedFrom : Joi.array()

                        } )
                    )
                })
            }
        }
    }
};

module.exports = [
    seeUserRoute
]