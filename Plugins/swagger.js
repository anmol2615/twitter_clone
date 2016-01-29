var pack = require('../package'),
    swaggerOptions = {
        info: {
            'title': 'Test API Documentation',
            'version': pack.version,
        }
        //apiVersion: pack.version,
        //pathPrefixSize: 3

    };

exports.register = function(server, options, next){

    server.register({
        register: require('hapi-swagger'),
        options: swaggerOptions
    }, function (err) {
        if (err) {
            server.log(['error'], 'hapi-swagger load error: ' + err)
        }else{
            server.log(['start'], 'hapi-swagger interface loaded')
        }
    });

    next();
};

exports.register.attributes = {
    name: 'swagger-plugin'
};