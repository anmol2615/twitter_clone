/**
 * Created by anmol on 5/2/16.
 */
'use strict';


var Joi = require('joi'),
    controller = require('../../Controllers/adminController');

var editUserRoute = {
    method : 'PUT',
    path : '/API/v1/admin/editUser',
    handler : function(request,reply) {
        controller.editUserProfile(request.headers.auth,request.payload,
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
               searchName: Joi.string().required(),
                name: Joi.string(),
                phoneNo: Joi.string(),
                email: Joi.string()
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
    editUserRoute
]