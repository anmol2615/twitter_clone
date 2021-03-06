/**
 * Created by anmol on 4/2/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/adminController');

var adminLogoutRoute = {
    method : 'GET',
    path : '/API/v1/admin/logout/{token}',
    handler : function (request,reply)
    {
        controller.adminLogoutLogic(request.params.token,function(err,result){
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
    config:{
        tags : ['api'],
        validate :
        {
            params:{
                token: Joi.string().required()
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
}

module.exports = [
    adminLogoutRoute
]