/**
 * Created by anmol on 2/25/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/adminController');

var noOfUsers = {
    method:'GET',
    path:'/API/v1/admin/noOfUsers/{fromDate}/{toDate}',
    handler : function (request,reply)
    {
        controller.getUserCount(request.headers.auth , request.params,function(err,result){
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
            params:{
                fromDate : Joi.date().format('DD-MM-YYYY').required(),
                toDate : Joi.date().min(Joi.ref('fromDate')).format('DD-MM-YYYY').required()
            },
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
                data : Joi.number()
            }
        }
    }
};

module.exports = [
    noOfUsers
];