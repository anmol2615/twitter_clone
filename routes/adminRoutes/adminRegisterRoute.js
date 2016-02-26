/**
 * Created by anmol on 3/2/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/adminController');

var adminRegisterRoute = {
    method:'POST',
    path:'/admin/register',
    handler : function (request,reply)
    {
        controller.adminRegister(request.payload.name , request.payload.password,request.payload.email,request.payload.phoneNo,request.payload.scope,function(err,result){
            if(err)
                reply(err.response).code(error.statusCode);
            else
                reply(result.response).code(result.statusCode);
        });
    },
    config:{
        tags:['api','register'],
        validate:{
            payload:{
                name : Joi.string().required(),
                email : Joi.string().required(),
                password : Joi.string().required(),
                phoneNo : Joi.string().required(),
                scope:Joi.string().valid(['ADMIN','SUPER_ADMIN']).required()

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
var clickToVerify = {
    method : 'GET',
    path : '/admin_verify/{token}',
    handler : function(request,reply)
    {
        controller.clickToVerify(request.params.token,function(err,result)
        {
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
    adminRegisterRoute,
    clickToVerify
]
