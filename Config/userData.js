'use strict'

var jwt = require('jsonwebtoken');
var id = 0;
const PRIVATEKEY = 'BbZJjyoXAdr8BUZuiKKARWimKfrSmQ6fv8kZ7OFfc';
var isLoggedIn = false;
var options = {
    'Ascending' : 'asc',
    'Descending' : 'desc'
}
//var validate = function (request, decodedToken, callback) {
//
//    console.log(decodedToken);  // should be {accountId : 123}.
//
//    if (decodedToken) {
//        console.log(userList[decodedToken].accountId.toString());
//    }
//
//    var account = userList[decodedToken];
//
//    if (!account) {
//        return callback(null, false);
//    }
//
//    return callback(null, true, account);
//};


var cipherToken = function (tokenData) {
    return jwt.sign(tokenData, PRIVATEKEY);
};

var decipherToken = function (token) {
    var decodedtoken=jwt.verify(token, PRIVATEKEY);
    return decodedtoken;
    };

var verifyLink = 'verify_email_link';

module.exports = {
    cipherToken: cipherToken,
    decipherToken: decipherToken,
    PRIVATEKEY : PRIVATEKEY,
    id : id,
    isLoggedIn : isLoggedIn,
    verifyLink : verifyLink,
    options : options
}