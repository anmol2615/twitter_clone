/**
 * Created by anmol on 2/16/16.
 */
'use strict';

var Joi = require('joi'),

    hapi = require('hapi'),
    multiparty = require('multiparty'),
    controller = require('../../Controllers/userController');

var picUpload = {
    method: 'POST',
    path: '/user/uploadImage',
    handler: function(request, reply)
    {

            controller.uploadPic(request.payload.token,request.payload.file,function(err,result){
                if(err)
                    reply(err.response).code(err.statusCode);
                else
                    reply(result.response).code(result.statusCode);
            });
    },
    config:
    {
        tags : ['api'],
        validate :
        {
            payload:
            {
                token : Joi.string().required(),
                file : Joi.any().meta({swaggerType : 'file'}).description("Browse image")
            }
        },
        payload: {
            maxBytes: 2097152,
            output: 'stream',
            parse: true,
            allow : 'multipart/form-data'
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
    picUpload
]