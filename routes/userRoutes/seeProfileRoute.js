/**
 * Created by anmol on 3/2/16.
 */
'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/userController');

var seeProfileRoute = {
    method : 'GET',
    path : '/seeProfile/{name}',
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
        plugins:{
            'hapi-swagger':{
                payloadType:"form"
            }}

    }
};

module.exports = [
    seeProfileRoute
]