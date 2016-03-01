'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/userController');

var editProfileRoute = {
    method : 'PUT',
    path : '/API/v1/user/edit',
    handler : function(request,reply) {
        controller.editProfile(request.headers.auth,request.payload,
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
                name: Joi.string(),
                password : Joi.string(),
                email :  Joi.string(),
                phoneNo: Joi.string()
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

    }
};

module.exports = [
    editProfileRoute
]