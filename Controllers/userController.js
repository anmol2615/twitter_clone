'use strict';

var async = require('async'),
    MODEL = require('../Model'),
    CONFIG = require('../Config'),
    orderOfDisplayingTweets = CONFIG.USER_DATA.options,
    Service = require('../Service');

//---------------------------------------------------------------------------------
//                                    SAVE USER
//---------------------------------------------------------------------------------
exports.saveUser = function(name, password, email, phoneNo,callbackUserRegister) {
    Service.crudQueries.userEnter(name, password, email, phoneNo);
    return callbackUserRegister(null,' Click on the link on your mail to verify');
}
/*--------------------------------------------------------------------------------
*                                   CLICK TO VERIFY
* --------------------------------------------------------------------------------
* */
exports.clickToVerify = function(token,callbackUserRegister)
{
    Service.crudQueries.update(MODEL.userDetailsModel,{token : token},{$set : {isVerified:true}},{lean:true},function(err, result){
        if(err)
        return callbackUserRegister(err)
        else
        return callbackUserRegister(null,'VERIFIED')
    })

}
/*--------------------------------------------------------------------------------
 *                                   USER LOGIN
 * --------------------------------------------------------------------------------
 * */
exports.userLoginLogic = function(name,password,callbackUserLogin) {
    var encryptedPassword = CONFIG.CRYPTO.encrypt(password);
    Service.crudQueries.update(MODEL.userDetailsModel,
        {name : name, password:encryptedPassword,isVerified : true},
        {$set: {loginToken: CONFIG.USER_DATA.cipherToken(name)}},
        {lean:true},
        function(err,result) {
                if (err) {
                    return callbackUserLogin(err)
                }
                else {
                    return callbackUserLogin(null, result)
                }
            })
        }
/*--------------------------------------------------------------------------------
 *                                   USER LOGOUT
 * --------------------------------------------------------------------------------
 * */

exports.userLogoutLogic = function(token,callbackUserLogout){
    Service.crudQueries.getOneData(MODEL.userDetailsModel,
        {loginToken : token},
        {$unset : {loginToken : 1}},
        {lean:true},
        function(err,result)
        {
            if(err)
                return callbackUserLogout (err)
            else
                return callbackUserLogout(null,result)
        })
}
/*--------------------------------------------------------------------------------
 *                                   TWEET
 * --------------------------------------------------------------------------------
 * */
exports.tweetLogic = function(token,tweet,visibility,callbackUserTweet){
    async.waterfall([
        function(callback)
        {
            Service.crudQueries.getData(MODEL.userDetailsModel,
                {loginToken : token},
                {},
                {lean : true},
                function(err,result) {
                    if (err)
                        callback(err);
                    else {
                        if (result.length)
                            callback(null, result)
                        else
                            callback(null, "User is not authenticated!");
                    }
                })
        },
        function(result,callback) {
            Service.crudQueries.saveData(MODEL.twitterModel, {
                id: result[0]._id,
                tweet: tweet,
                visibility : visibility,
                timestamp: Date.now()
            }, callback)
        }
    ], function (err, result) {
        if (err) {
            return callbackUserTweet(err)
        }
        else {
            return callbackUserTweet(null,result)
        }
    })
}
/*--------------------------------------------------------------------------------
 *                                   DISPLAY TWEETS
 * --------------------------------------------------------------------------------
 * */

exports.displayTweets = function(token,field,callbackDisplayRoute)
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
                    callback(err)
                }
                else
                {

                    if(result.length)
                    {
                        callback(null,result);
                    }
                    else
                    {
                        callback(null,"User is not authenticated!")
                    }
                }
            })
        },
        function(result,callback){
            result[0].following.push(result[0]._id);
            Service.crudQueries.getDataWithReference(MODEL.twitterModel,
                {id: {$in : result[0].following}},
                {},
                {lean : true,sort : {timestamp : orderOfDisplayingTweets[field]}},
                {path:'id',select:'name'},callback)
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
}
/*--------------------------------------------------------------------------------
 *                                   FOLLOW BY NAME
 * --------------------------------------------------------------------------------
 * */
exports.followSomeoneLogic = function(token,name,callbackfollowSomeone) {
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
                    callback(err)
                }
                else
                {
                    callback(null,result)
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
                callback(err)
                else
                callback(null,result)
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
                    callback(err);
                else {
                    callback(null, result);
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
}
