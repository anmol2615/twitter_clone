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
        plugins:{
            'hapi-swagger':{
                payloadType:"form"
            }}

    }
};

module.exports = [
    seeUserRoute
]