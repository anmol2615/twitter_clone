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

var toObject = function (arr) {
    var rv = {};
    for (var i = 0; i < arr.length; ++i)
        rv[arr[i].code] = {description : arr[i].message};
    return rv;
};

var cipherToken = function (tokenData) {
    return jwt.sign(tokenData, PRIVATE_KEY);
};

var decipherToken = function (token) {
    return jwt.verify(token, PRIVATE_KEY);
    };

var verifyLink = 'verify_email_link';
var adminVerify = 'admin_verify';

const ADMIN_CLASS = {
    ADMIN : 'admin',
    SUPER_ADMIN : 'superAdmin'
};
module.exports = {
    cipherToken: cipherToken,
    decipherToken: decipherToken,
    PRIVATE_KEY : PRIVATE_KEY,
    id : id,
    imagePath : '../images',
    isLoggedIn : isLoggedIn,
    verifyLink : verifyLink,
    options : options,
    toObject : toObject,
    responseObject : responseObject,
    ADMIN_CLASS: ADMIN_CLASS,
    adminVerify : adminVerify
}