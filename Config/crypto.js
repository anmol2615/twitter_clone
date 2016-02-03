'use strict';


var crypto = require('crypto'),
    CONFIG = require('../Config/userData'),
    KEY = CONFIG.PRIVATE_KEY,
    algorithm = 'aes-256-ctr';

//var privateKey = Config.key.privateKey;

// create reusable transport method (opens pool of SMTP connections)
//console.log(Config.email.username+"  "+Config.email.password);

// method to decrypt data(password)
function decrypt(password) {
    var decipher = crypto.createDecipher(algorithm, KEY);
    var dec = decipher.update(password, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

// method to encrypt data(password)
function encrypt(password) {
    var cipher = crypto.createCipher(algorithm, KEY);
    var crypted = cipher.update(password, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

exports.decrypt = function(password) {
    return decrypt(password);
}

exports.encrypt = function(password) {
    return encrypt(password);
}