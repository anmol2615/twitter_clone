/**
 * Created by anmol on 2/25/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/adminController');

var allUsersTogether = {
    method:'GET',
    path:'/API/v1/admin/countUsers',
    handler : function (request,reply)
    {
        controller.wholeUsersTogether(request.headers.auth ,function(err,result){
            if(err)
                reply(err.response).code(err.statusCode);
            else
                reply(result.response).code(result.statusCode);
        });
    },
    config:{
        tags:['api','register'],
        validate:{
            headers : Joi.object({
                auth : Joi.string().required()
            }).options({ allowUnknown: true }),
            failAction : function(request,reply,source,error){
                reply()
            }
        },
        response : {
            options : {
                allowUnknown : true
            },
            schema : {
                message : Joi.string().required(),
                //data : Joi.number()
            }
        }
    }
};

module.exports = [
    allUsersTogether
];