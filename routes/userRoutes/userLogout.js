'use strict';

var Joi = require('joi'),
    controller = require('../../Controllers/userController');

var logoutRoute = {
    method : 'GET',
    path : '/v1/logout/{token}',
    handler : function (request,reply)
    {
        controller.userLogoutLogic(request.params.token,function(err,result){
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
        plugins:{
            'hapi-swagger':{
                payloadType:"form"
            }}
    }
}

module.exports = [
    logoutRoute
]