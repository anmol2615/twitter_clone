'use strict';

var async = require('async'),
    MODEL = require('../Model'),
    CONFIG = require('../Config'),
    Jwt = require('jsonwebtoken'),
    orderOfDisplayingTweets = CONFIG.USER_DATA.options,
    responseObject = CONFIG.USER_DATA.responseObject,
    ERROR_RESPONSE = CONFIG.RESPONSE_MESSAGES.ERROR_MESSAGES,
    SUCCESS_RESPONSE = CONFIG.RESPONSE_MESSAGES.SUCCESS_MESSAGES,
    SWAGGER_RESPONSE = CONFIG.RESPONSE_MESSAGES.SWAGGER_DEFAULT_RESPONSE_MESSAGES,
    Service = require('../Service');
//---------------------------------------------------------------------------------
//                                    SAVE USER
//---------------------------------------------------------------------------------
var userRegistrationLogic = function(name,password,email,phoneNo,callbackuserRegistration)
{
    var tokenData = {
        email: email
    };
    async.waterfall([
        function(callback)
        {
            Service.crudQueries.saveData(MODEL.userDetailsModel,{
                name: name,
                password : CONFIG.CRYPTO.encrypt(password),
                email : email,
                phoneNo : phoneNo,
                token: CONFIG.USER_DATA.cipherToken(tokenData)
            },callback)
        }
    ],function(err,result){
        if(err){
            if(err.code === 11000) {
            return callbackuserRegistration(responseObject(ERROR_RESPONSE.USERNAME_ALREADY_EXISTS,
                {},SWAGGER_RESPONSE[5].code))
            }
            return callbackuserRegistration(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                SWAGGER_RESPONSE[6].code));
        }
        else {
            Service.mailVerification.sendLink(email,CONFIG.USER_DATA.cipherToken(tokenData));
            return callbackuserRegistration(null, responseObject(SUCCESS_RESPONSE.REGISTRATION_SUCCESSFUL,
                {},SWAGGER_RESPONSE[1].code));
        }
    })
}
/*--------------------------------------------------------------------------------
*                                   CLICK TO VERIFY
* --------------------------------------------------------------------------------
* */
var clickToVerify = function(token,callbackUserRegister)
{
    Service.crudQueries.update(MODEL.userDetailsModel,{token : token},{$set : {isVerified:true}},{lean:true},function(err, result){
        if(err)
        return callbackUserRegister(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
        SWAGGER_RESPONSE[6].code))
        else
        {
            console.log(result);
            return callbackUserRegister(null,responseObject(SUCCESS_RESPONSE.EMAIL_VERIFIED,{},
        SWAGGER_RESPONSE[0].code))}
    })

}
/*--------------------------------------------------------------------------------
 *                                   USER LOGIN
 * --------------------------------------------------------------------------------
 * */
var userLoginLogic = function(name,password,callbackUserLogin) {
    var encryptedPassword = CONFIG.CRYPTO.encrypt(password);
    async.waterfall([
        function(callback){
            Service.crudQueries.findOne(MODEL.userDetailsModel,
                {name : name, password:encryptedPassword,isVerified : true},{},{lean:true},
                function(err,result) {
                    if (err) {
                        return callback(responseObject(SWAGGER_RESPONSE[6].message,{},
                            SWAGGER_RESPONSE[6].code));
                    }
                    else {
                        if(result)
                            return callback(null,result);
                        else
                        {
                            return callback(responseObject(ERROR_RESPONSE.ACCESS_DENIED,result,
                                SWAGGER_RESPONSE[3].code));}

                    }
                })
        },function(result,callback){
            Service.crudQueries.update(MODEL.userDetailsModel,
                {name : name, password:encryptedPassword,isVerified : true},
                {$set: {loginToken: CONFIG.USER_DATA.cipherToken(result._id)}},
                function(err,result) {
                    if (err) {
                        return callback(responseObject(SWAGGER_RESPONSE[6].message,{},
                            SWAGGER_RESPONSE[6].code));
                    }
                    else {
                        if(result.n)
                            return callback(null,responseObject(SUCCESS_RESPONSE.LOGIN_SUCCESSFULLY,result,
                                SWAGGER_RESPONSE[0].code));
                        else
                            return callback(responseObject(ERROR_RESPONSE.USER_ALREADY_LOGGED_IN,{},
                                SWAGGER_RESPONSE[5].code));

                    }
                })
        }],function(err,result){
                if(err)
                callbackUserLogin(err);
                else
                callbackUserLogin(null,result);
    })
        };
/*--------------------------------------------------------------------------------
 *                                   USER LOGOUT
 * --------------------------------------------------------------------------------
 * */

var userLogoutLogic = function(token,callbackUserLogout){
    Service.crudQueries.update(MODEL.userDetailsModel,
        {loginToken : token},
        {$unset : {loginToken : 1}},
        {lean:true},
        function(err,result)
        {
            if(err)
                return callbackUserLogout (responseObject(SWAGGER_RESPONSE[6].message,{},
                    SWAGGER_RESPONSE[6].code));
            else{
                if(result.n)
                return callbackUserLogout(null,responseObject(SUCCESS_RESPONSE.LOGOUT_SUCCESSFULLY,{},
                    SWAGGER_RESPONSE[0].code));
                return callbackUserLogout(null,responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                SWAGGER_RESPONSE[2].code));
            }
        })
};
/*--------------------------------------------------------------------------------
 *                                   TWEET
 * --------------------------------------------------------------------------------
 * */
var tweetLogic = function(token,tweet,visibility,callbackUserTweet){
    async.waterfall([
        function(callback)
        {
            Service.crudQueries.getData(MODEL.userDetailsModel,
                {loginToken : token},
                {_id:1},
                {lean : true},
                function(err,result) {
                    if (err) {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                        SWAGGER_RESPONSE[6].code));
                    }
                    else {
                        if (result.length){
                            callback(null, result);
                    }
                        else
                            callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                            SWAGGER_RESPONSE[3].code));
                    }
                })
        },
        function(result,callback) {
            Service.crudQueries.saveData(MODEL.twitterModel, {
                id: result[0]._id,
                tweet: tweet,
                visibility : visibility,
                timestamp: Date.now(),
            }, function(err,result){
                if(err)
                callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                    SWAGGER_RESPONSE[6].code));
                else
                    callback(null,result);
            })
        }
    ], function (err, result) {
        if (err) {
            return callbackUserTweet(err);
        }
        else {
            return callbackUserTweet(null,responseObject(SUCCESS_RESPONSE.TWEETED,tweet,
            SWAGGER_RESPONSE[1].code))
        }
    })
}
/*--------------------------------------------------------------------------------
 *                                   DISPLAY TWEETS
 * --------------------------------------------------------------------------------
 * */

var displayTweets = function(token,field,callbackDisplayRoute)
{
    async.waterfall([
        function(callback)
        {
            Service.crudQueries.getData(MODEL.userDetailsModel,
                {loginToken : token},
                {},
                {lean : true},
                function(err,result){
                if(err) {
                    callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                    SWAGGER_RESPONSE[6].code));
                }
                else
                {

                    if(result.length)
                    {
                        callback(null,result);
                    }
                    else
                    {
                        callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                        SWAGGER_RESPONSE[4].code))
                    }
                }
            })
        },
        function(result,callback){
            result[0].following.push(result[0]._id);
            Service.crudQueries.getDataWithReference(MODEL.twitterModel,
                {id: {$in : result[0].following}},
                {_id:0,tweet:1,timestamp:1,id:1},
                {lean : true,sort : {timestamp : orderOfDisplayingTweets[field]}},
                {path:'id',select:'name'},function(err,result){
                    if(err)
                    callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                    SWAGGER_RESPONSE[6].code))
                    else
                    callback(null,responseObject(SWAGGER_RESPONSE[0].message,result,
                    SWAGGER_RESPONSE[0].code))
                })
        }
    ],function(err,result){
        if(err)
        {
            return callbackDisplayRoute(err)
        }
        else
        {
            return callbackDisplayRoute(null,result)
        }
    })
};
/*--------------------------------------------------------------------------------
 *                                   FOLLOW BY NAME
 * --------------------------------------------------------------------------------
 * */
var followSomeoneLogic = function(token,name,callbackfollowSomeone) {
    async.waterfall([
        function(callback)
        {
            Service.crudQueries.getData(MODEL.userDetailsModel,
                {loginToken : token},
                {},
                {lean : true},
                function(err,result){
                if(err)
                {
                    callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                        SWAGGER_RESPONSE[6].code))
                }
                else
                {
                    if(result.length)
                    callback(null,result);
                    else
                        callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,result,
                    SWAGGER_RESPONSE[3].code))
                }
            })
        },
        function(result,callback){
            Service.crudQueries.getOneData(MODEL.userDetailsModel,
                {name : name},
                {$addToSet : {followers : result[0]._id}},
                {lean : true},
                function(err,result){
                if(err)
                callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                    SWAGGER_RESPONSE[6].code))
                else {
                    if(result)
                        callback(null,result)
                    else
                        callback(responseObject(ERROR_RESPONSE.USER_NOT_FOUND,result,
                        SWAGGER_RESPONSE[4].code))
                }
            })
        },
        function(result,callback) {
            console.log(result);
            Service.crudQueries.getOneData(MODEL.userDetailsModel,
                {loginToken: token},
                {$addToSet: {following: result._id}},
                {lean: true},
                function (err, result) {
                if (err)
                    callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                    SWAGGER_RESPONSE[6].code));
                else {
                    callback(null, responseObject(SUCCESS_RESPONSE.FOLLOWING,name,
                        SWAGGER_RESPONSE[0].code));
                }
            })
        }
    ],function(err,result){
        if(err)
        {
            return callbackfollowSomeone(err)
        }
        else
        {
            return callbackfollowSomeone(null,result);
        }
    })
};
/*--------------------------------------------------------------------------------
 *                                   UNFOLLOW BY NAME
 * --------------------------------------------------------------------------------
 * */
var unfollowSomeoneLogic = function(token,name,callbackunfollowSomeone) {
    async.waterfall([
        function(callback)
        {
            Service.crudQueries.getData(MODEL.userDetailsModel,
                {loginToken : token},
                {_id : 1},
                {lean : true},
                function(err,result){
                    if(err)
                    {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                        SWAGGER_RESPONSE[6].code))
                    }
                    else
                    {
                        if(result.length)
                        callback(null,result)
                        else
                        callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                        SWAGGER_RESPONSE[3].code))
                    }
                })
        },
        function(result,callback){
            Service.crudQueries.getOneData(MODEL.userDetailsModel,
                {name : name},
                {$pull : {followers : result[0]._id}},
                {lean : true},
                function(err,result){
                    if(err)
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                            SWAGGER_RESPONSE[6].code))
                    else {
                        if(result.length)
                        callback(null,result)
                        else
                        callback(responseObject(ERROR_RESPONSE.USER_NOT_FOUND,{},
                        SWAGGER_RESPONSE[4].code))
                    }
                })
        },
        function(result,callback) {
            Service.crudQueries.getOneData(MODEL.userDetailsModel,
                {loginToken: token},
                {$pull: {following: result._id}},
                {lean: true},
                function (err, result) {
                    if (err)
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                            SWAGGER_RESPONSE[6].code));
                    else {
                        callback(null, responseObject(SUCCESS_RESPONSE.UNFOLLOWED,name,
                        SWAGGER_RESPONSE[0].code));
                    }
                })
        }
    ],function(err,result){
        if(err)
        {
            return callbackunfollowSomeone(err)
        }
        else
        {
            return callbackunfollowSomeone(null,result);
        }
    })
};
/*--------------------------------------------------------------------------------
 *                                   EDIT PROFILE
 * --------------------------------------------------------------------------------
 * */
var editProfile = function(token,payload,callbackEditProfile){
    if(payload.password)
        payload.password = CONFIG.CRYPTO.encrypt(payload.password) ;
    async.waterfall([
        function(callback) {
            if(payload.email){
                Service.crudQueries.update(MODEL.userDetailsModel, {loginToken: token},
                {$set : payload,isVerified:false}, {lean: true}, function (err, result) {
                    if (err)
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                        SWAGGER_RESPONSE[6].code));
                    else {
                        if(result.n) {
                            Service.mailVerification.sendLink(payload.email,CONFIG.USER_DATA.cipherToken(payload.email));
                        callback(null, responseObject(SUCCESS_RESPONSE.REGISTRATION_SUCCESSFUL,{},
                        SWAGGER_RESPONSE[0].code));
                        }
                        else
                        callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                        SWAGGER_RESPONSE[3].code))
                    }

                });

            }
            else
            {
                Service.crudQueries.update(MODEL.userDetailsModel,{loginToken:token},
                    {$set : payload},{lean:true}, function(err,result){
                        if (err)
                            callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                                SWAGGER_RESPONSE[6].code));
                        else {
                            if(result.n) {
                                callback(null, responseObject(SUCCESS_RESPONSE.DETAILS_UPDATED,{},
                                    SWAGGER_RESPONSE[0].code));
                            }
                            else
                                callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                                    SWAGGER_RESPONSE[3].code))
                        }
                    })
            }
        }
    ],function(err,result){
        if(err)
        callbackEditProfile(err);
        else
        callbackEditProfile(null,result);
    })
};
/*--------------------------------------------------------------------------------
 *                                   SEE PROFILE
 * --------------------------------------------------------------------------------
 **/
var seeProfile = function(token,name,callbackDisplayRoute) {
    async.auto({
        function (callback) {
            Service.crudQueries.findOne(MODEL.userDetailsModel,
                {loginToken: token},
                {_id: 0, following: 1},
                {lean: true},
                function (err, result) {
                    if (err) {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                            SWAGGER_RESPONSE[6].code));
                    }
                    else {
                        if (result) {
                            callback(null, result);
                        }
                        else {
                            callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                                SWAGGER_RESPONSE[4].code))
                        }
                    }
                })
        },
        searchUser: function (result, callback) {
            Service.crudQueries.findOne(MODEL.userDetailsModel,
                {name: name},
                {_id: 1},
                {lean: true},
                function (err, result) {
                    if (err) {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                            SWAGGER_RESPONSE[6].code));
                    }
                    else {
                        if (result) {
                            callback(null, result);
                        }
                        else {
                            callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                                SWAGGER_RESPONSE[4].code))
                        }
                    }
                })
        },
        ifInFollowing: ['searchUser', function (result, callback) {
            Service.crudQueries.findOne(MODEL.twitterModel,
                {id: result.searchUser._id},
                {_id: 0, id: 0, tweet: 1, timestamp: 1},
                {lean: true},
                function (err, result) {
                    if (err) {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                            SWAGGER_RESPONSE[6].code));
                    }
                    else {
                        if (result) {
                            callback(null, responseObject(SUCCESS_RESPONSE.ACTION_COMPLETE, result,
                                SWAGGER_RESPONSE[0].code));
                        }
                        else {
                            callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                                SWAGGER_RESPONSE[4].code))
                        }
                    }
                })
        }]
    }, function (err, result) {
        if (err) {
            return callbackDisplayRoute(err)
        }
        else {
            return callbackDisplayRoute(null, result)
        }
    })
};
/*--------------------------------------------------------------------------------
 *                                   EXPORTS
 * --------------------------------------------------------------------------------
 **/
module.exports = {
    userRegistrationLogic: userRegistrationLogic,
    clickToVerify : clickToVerify,
    userLoginLogic : userLoginLogic,
    userLogoutLogic : userLogoutLogic,
    tweetLogic : tweetLogic,
    displayTweets : displayTweets,
    followSomeoneLogic : followSomeoneLogic,
    unfollowSomeoneLogic : unfollowSomeoneLogic,
    editProfile:editProfile,
    seeProfile:seeProfile
}