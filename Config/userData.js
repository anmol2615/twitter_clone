'use strict';

var jwt = require('jsonwebtoken');
var id = 0;
const PRIVATE_KEY = 'BbZJjyoXAdr8BUZuiKKARWimKfrSmQ6fv8kZ7OFfc';
var isLoggedIn = false;
var options = {
    'Ascending' : 'asc',
    'Descending' : 'desc'
};
var responseObject = function(message,data,code){
    return ({response:{
        message:message,
        data :data
    },
    statusCode: code})
};
var cipherToken = function (tokenData) {
    return jwt.sign(tokenData, PRIVATE_KEY);
};

var decipherToken = function (token) {
    return jwt.verify(token, PRIVATE_KEY);
    };

var verifyLink = 'verify_email_link';

module.exports = {
    cipherToken: cipherToken,
    decipherToken: decipherToken,
    PRIVATE_KEY : PRIVATE_KEY,
    id : id,
    isLoggedIn : isLoggedIn,
    verifyLink : verifyLink,
    options : options,
    responseObject : responseObject
}