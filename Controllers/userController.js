'use strict';

var async = require('async'),
    MODEL = require('../Model'),
    fs= require('fs'),
    path = require('path'),
    CONFIG = require('../Config'),
    orderOfDisplayingTweets = CONFIG.USER_DATA.options,
    responseObject = CONFIG.USER_DATA.responseObject,
    ERROR_RESPONSE = CONFIG.RESPONSE_MESSAGES.ERROR_MESSAGES,
    SUCCESS_RESPONSE = CONFIG.RESPONSE_MESSAGES.SUCCESS_MESSAGES,
    STATUS_CODE = CONFIG.CONSTANTS.STATUS_CODE,
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
                timeOfRegistration : Date.now(),
                phoneNo : phoneNo,
                token: CONFIG.USER_DATA.cipherToken(tokenData)
            },callback)
        }
    ],function(err,result){
        if(err){
            if(err.code === 11000) {
            return callbackuserRegistration(responseObject(ERROR_RESPONSE.USERNAME_ALREADY_EXISTS,
                {},STATUS_CODE.ALREADY_EXISTS_CONFLICT))
            }
            return callbackuserRegistration(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
            STATUS_CODE.SERVER_ERROR));
        }
        else {
            Service.mailVerification.sendLink(email,CONFIG.USER_DATA.cipherToken(tokenData));
            return callbackuserRegistration(null, responseObject(SUCCESS_RESPONSE.REGISTRATION_SUCCESSFUL,
                {},STATUS_CODE.CREATED));
        }
    })
};
/*--------------------------------------------------------------------------------
*                                   CLICK TO VERIFY
* --------------------------------------------------------------------------------
* */
var clickToVerify = function(token,callbackUserRegister)
{
    Service.crudQueries.update(MODEL.userDetailsModel,{token : token},{$set : {isVerified:true}},{lean:true},function(err, result){
        if(err)
        return callbackUserRegister(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
        STATUS_CODE.SERVER_ERROR));
        else
        {
            return callbackUserRegister(null,responseObject(SUCCESS_RESPONSE.EMAIL_VERIFIED,{},
        STATUS_CODE.OK))}
    })

};
/*--------------------------------------------------------------------------------
 *                                   USER LOGIN
 * --------------------------------------------------------------------------------
 * */
var userLoginLogic = function(payload,callbackUserLogin) {
    var encryptedPassword = CONFIG.CRYPTO.encrypt(payload.password);
    async.waterfall([
        function(callback){
            Service.crudQueries.findOneWithLimit(MODEL.userDetailsModel,
                {name : payload.name, password:encryptedPassword,isVerified : true, isDeleted:false},{_id : 1},{lean:true},
                function(err,result) {
                    if (err) {
                        return callback(responseObject(SWAGGER_RESPONSE[6].message,{},
                            STATUS_CODE.SERVER_ERROR));
                    }
                    else {
                        if(result.length){
                            return callback(null,result);

                        }
                        else
                        {
                            return callback(responseObject(ERROR_RESPONSE.ACCESS_DENIED,{},
                                STATUS_CODE.UNAUTHORIZED));}

                    }
                })
        },function(result,callback){
            var auth = CONFIG.USER_DATA.cipherToken(result[0]._id);
            Service.crudQueries.update(MODEL.userDetailsModel,
                {name : payload.name, password:encryptedPassword,isVerified : true},
                {$set: {loginToken: auth}},
                function(err,result) {
                    if (err) {
                        return callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                            STATUS_CODE.SERVER_ERROR));
                    }
                    else {
                        if(result.n)
                            return callback(null,responseObject(SUCCESS_RESPONSE.LOGIN_SUCCESSFULLY,auth,
                                STATUS_CODE.OK));
                        else
                        {
                            return callback(responseObject(ERROR_RESPONSE.USER_ALREADY_LOGGED_IN,{},
                                STATUS_CODE.ALREADY_EXISTS_CONFLICT));
                        }

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
        {loginToken : token, isDeleted : false},
        {$unset : {loginToken : 1}},
        {lean:true},
        function(err,result)
        {
            if(err)
                return callbackUserLogout (responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                    STATUS_CODE.SERVER_ERROR));
            else{
                if(result.n)
                return callbackUserLogout(null,responseObject(SUCCESS_RESPONSE.LOGOUT_SUCCESSFULLY,{},
                    STATUS_CODE.OK));
                return callbackUserLogout(null,responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                STATUS_CODE.UNAUTHORIZED));
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
            Service.crudQueries.findOneWithLimit(MODEL.userDetailsModel,
                {loginToken : token},
                {_id:1},
                {lean : true},
                function(err,result) {
                    if (err) {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                        STATUS_CODE.SERVER_ERROR));
                    }
                    else {
                        if (result.length){
                            callback(null, result);
                    }
                        else
                            callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                            STATUS_CODE.UNAUTHORIZED));
                    }
                })
        },
        function(result,callback) {
            Service.crudQueries.saveData(MODEL.twitterModel, {
                id: result[0]._id,
                tweet: tweet,
                visibility : visibility,
                timestamp: Date.now()
            }, function(err,result){
                if(err)
                callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                    STATUS_CODE.SERVER_ERROR));
                else
                    callback(null,responseObject(SUCCESS_RESPONSE.TWEETED,tweet,
                        STATUS_CODE.CREATED));
            })
        }
    ], function (err, result) {
        if (err) {
            return callbackUserTweet(err);
        }
        else {
            return callbackUserTweet(null,result);
        }
    })
};
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
                {_id:1,following:1},
                {lean : true},
                function(err,result){
                if(err) {
                    callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                    STATUS_CODE.SERVER_ERROR));
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
                        STATUS_CODE.UNAUTHORIZED))
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
                    STATUS_CODE.SERVER_ERROR));
                    else
                    callback(null,responseObject(SUCCESS_RESPONSE.ACTION_COMPLETE,result,
                    STATUS_CODE.OK));
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
                        STATUS_CODE.SERVER_ERROR))
                }
                else
                {
                    if(result.length)
                    callback(null,result);
                    else
                        callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                    STATUS_CODE.UNAUTHORIZED))
                }
            })
        },
        function(result,callback){
            Service.crudQueries.getOneData(MODEL.userDetailsModel,
                {name : name , isDeleted : false},
                {$addToSet : {followers : result[0]._id}},
                {lean : true},
                function(err,result){
                if(err)
                callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                    STATUS_CODE.SERVER_ERROR))
                else {
                    if(result)
                        callback(null,result)
                    else
                        callback(responseObject(ERROR_RESPONSE.USER_NOT_FOUND,{},
                        STATUS_CODE.NOT_FOUND))
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
                    STATUS_CODE.SERVER_ERROR));
                else {
                    callback(null, responseObject(SUCCESS_RESPONSE.FOLLOWING,name,
                        STATUS_CODE.OK));
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
                        STATUS_CODE.SERVER_ERROR))
                    }
                    else
                    {
                        if(result.length)
                        callback(null,result)
                        else
                        callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                        STATUS_CODE.UNAUTHORIZED))
                    }
                })
        },
        function(result,callback){
            Service.crudQueries.getOneData(MODEL.userDetailsModel,
                {name : name, isDeleted:false},
                {$pull : {followers : result[0]._id}},
                {lean : true},
                function(err,result){
                    if(err)
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                            STATUS_CODE.SERVER_ERROR))
                    else {
                        if(result.length)
                        callback(null,result)
                        else
                        callback(responseObject(ERROR_RESPONSE.USER_NOT_FOUND,{},
                        STATUS_CODE.NOT_FOUND))
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
                            STATUS_CODE.SERVER_ERROR));
                    else{
                        callback(null, responseObject(SUCCESS_RESPONSE.UNFOLLOWED,name,
                        STATUS_CODE.OK));
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
                Service.crudQueries.update(MODEL.userDetailsModel, {loginToken: token, isDeleted: false},
                {$set : payload,isVerified:false,token:CONFIG.USER_DATA.cipherToken(payload.email)}, {lean: true}, function (err, result) {
                    if (err)
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                        STATUS_CODE.SERVER_ERROR));
                    else {
                        if(result.n) {
                            Service.mailVerification.sendLink(payload.email,CONFIG.USER_DATA.cipherToken(payload.email));
                        callback(null, responseObject(SUCCESS_RESPONSE.REGISTRATION_SUCCESSFUL,{},
                        STATUS_CODE.OK));
                        }
                        else
                        callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                        STATUS_CODE.UNAUTHORIZED))
                    }

                });

            }
            else
            {
                Service.crudQueries.update(MODEL.userDetailsModel,{loginToken:token},
                    {$set : payload},{lean:true}, function(err,result){
                        if (err)
                            callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                                STATUS_CODE.SERVER_ERROR));
                        else {
                            if(result.n) {
                                callback(null, responseObject(SUCCESS_RESPONSE.DETAILS_UPDATED,{},
                                    STATUS_CODE.OK));
                            }
                            else
                                callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                                    STATUS_CODE.UNAUTHORIZED))
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
        authorize:  function (callback) {
                Service.crudQueries.getData(MODEL.userDetailsModel,
                {loginToken: token},
                {_id: 0, following: 1},
                {lean: true},
                function (err, result) {
                    if (err) {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                            STATUS_CODE.SERVER_ERROR));
                    }
                    else {
                        if (result) {
                            callback(null, result);
                        }
                        else {
                            callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                                STATUS_CODE.UNAUTHORIZED))
                        }
                    }
                })
        },
        searchUser: ['authorize',function (callback,result) {
            if(result.authorize.length){
                Service.crudQueries.findOne(MODEL.userDetailsModel,
                    {name: name},
                    {_id: 1,following:1,followers:1},
                    {lean: true},
                    function (err, result) {
                        if (err) {
                            callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                                STATUS_CODE.SERVER_ERROR));
                        }
                        else {
                            if (result) {
                                result.noOfFollowers = result.followers.length;
                                result.noOfFollowing = result.following.length;
                                callback(null,result);
                            }
                            else {
                                callback(responseObject(ERROR_RESPONSE.USER_NOT_FOUND, {},
                                    STATUS_CODE.NOT_FOUND))
                            }
                        }
                    })
                }
            else {
                callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                    STATUS_CODE.UNAUTHORIZED))

            }
        }],
        ifInFollowing: ['searchUser', function (callback, result) {
            var userInfo = result.searchUser;
            Service.crudQueries.getData(MODEL.twitterModel,
                {id: result.searchUser._id},
                {_id: 0, id:1, tweet: 1, timestamp: 1},
                {lean: true},
                function (err, result) {
                    if (err) {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                            STATUS_CODE.SERVER_ERROR));
                    }
                    else {
                        if (result) {
                            callback(null, responseObject(SUCCESS_RESPONSE.ACTION_COMPLETE,{USER_DETAILS: userInfo,
                                TWEETS : result},
                                STATUS_CODE.OK));
                        }
                        else {
                            callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                                STATUS_CODE.UNAUTHORIZED))
                        }
                    }
                })
        }]
    }, function (err, result) {
        if (err) {
            return callbackDisplayRoute(err)
        }
        else {
            return callbackDisplayRoute(null, result.ifInFollowing)
        }
    })
};
/*--------------------------------------------------------------------------------
 *                                   RE_TWEET
 * --------------------------------------------------------------------------------
 **/
var re_TweetLogic = function(token,payload,callbackRoute) {
    var visibility = payload.visibility,
        tweetid = payload.tweetid;

    async.auto({
        authorize:  function (callback) {
            Service.crudQueries.findOneWithLimit(MODEL.userDetailsModel,
                {loginToken: token},
                {_id: 1},
                {lean: true},
                function (err, result) {
                    if (err) {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                            STATUS_CODE.SERVER_ERROR));
                    }
                    else {
                        if (result.length) {
                            callback(null, result);
                        }
                        else {
                            callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                                STATUS_CODE.UNAUTHORIZED))
                        }
                    }
                })
        },
        findTweet: ['authorize',function (callback,result) {
                //console.log(result);
                Service.crudQueries.findOneWithLimit(MODEL.twitterModel,
                    {_id : tweetid},
                    {_id:1,tweet:1},
                    {lean: true},
                    function (err, result) {
                        if (err) {
                            callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                                STATUS_CODE.SERVER_ERROR));
                        }
                        else {

                            if (result.length) {
                                callback(null,result);
                            }
                            else {
                                callback(responseObject(ERROR_RESPONSE.TWEET_NOT_FOUND, {},
                                    STATUS_CODE.NOT_FOUND))
                            }
                        }
                    })
        }],
        reTweet: ['authorize','findTweet', function (callback, result) {
            Service.crudQueries.saveData(MODEL.twitterModel,{
                //_id: result.findTweet[0]._id,
                id : result.authorize[0]._id,
                tweet : result.findTweet[0].tweet,
                visibility: visibility,
                timestamp :Date.now(),
                reTweetedFrom : result.findTweet[0].id
                },
                function (err, result) {
                    if (err) {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                            STATUS_CODE.SERVER_ERROR));
                    }
                    else {
                        if (result) {
                            callback(null, responseObject(SUCCESS_RESPONSE.ACTION_COMPLETE,{},
                                STATUS_CODE.OK));
                        }
                        else {
                            callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                                STATUS_CODE.UNAUTHORIZED))
                        }
                    }
                })
        }]
    }, function (err, result) {
        if (err) {
            return callbackRoute(err)
        }
        else {
            return callbackRoute(null, result.reTweet)
        }
    })
};
/*--------------------------------------------------------------------------------
 *                                   LIKE_TWEET
 * --------------------------------------------------------------------------------
 **/
var likeTweet = function(token,tweetid,callbackRoute) {
    async.auto({
        authorize:  function (callback) {
            Service.crudQueries.findOneWithLimit(MODEL.userDetailsModel,
                {loginToken: token},
                {_id: 1},
                {lean: true},
                function (err, result) {
                    if (err) {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                            STATUS_CODE.SERVER_ERROR));
                    }
                    else {
                        if (result) {
                            callback(null, result);
                        }
                        else {
                            callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                                STATUS_CODE.UNAUTHORIZED))
                        }
                    }
                })
        },
        addToLikeArray: ['authorize',function (callback,result) {
            if(result.authorize.length){
                Service.crudQueries.update(MODEL.twitterModel,
                    {_id : tweetid},
                    {$addToSet : {likedBy : result.authorize[0]._id}},
                    {lean: true},
                    function (err, result) {
                        if (err) {
                            callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                                STATUS_CODE.SERVER_ERROR));
                        }
                        else {
                           callback(null,result);
                        }
                    })
            }
            else {
                callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                    STATUS_CODE.UNAUTHORIZED))

            }
        }],
        ifAlreadyLiked: ['authorize','addToLikeArray', function (callback, result) {
            if(result.addToLikeArray.modified == 1){
                callback(null,responseObject(SUCCESS_RESPONSE.LIKED,{},
                    STATUS_CODE.OK));
            }
            else{
                Service.crudQueries.update(MODEL.twitterModel,
                    {_id: tweetid},
                    {$pull : { likedBy : result.authorize[0]._id}},
                    {lean : true},
                    function (err, result) {
                        if (err) {
                            callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, {},
                                STATUS_CODE.SERVER_ERROR));
                        }
                        else {
                            if (result) {
                                callback(null, responseObject(SUCCESS_RESPONSE.ACTION_COMPLETE, {},
                                    STATUS_CODE.OK));
                            }
                            else {
                                callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                                    STATUS_CODE.UNAUTHORIZED))
                            }
                        }
                    })
            }

        }]
    }, function (err, result) {
        if (err) {
            return callbackRoute(err)
        }
        else {
            return callbackRoute(null, result.addToLikeArray)
        }
    })
};

/*--------------------------------------------------------------------------------
 *                                   UPLOAD PIC
 * --------------------------------------------------------------------------------
 **/
var uploadPic = function(token,file,callbackRoute) {
    var data = file;
    if (data.hapi.headers['content-type'].split("/")[0] == 'image') {
        var name = data.hapi.filename;
        var storePath = '__dirname/uploadImages'+name;
        console.log(storePath);
        var newFile = fs.createWriteStream(storePath);
        data.pipe(newFile);
        //newFile.on('error', function (err) {
        //    console.error('pussy')
        //});
        //
        //data.file.pipe(newFile);
        //
        //data.file.on('end', function (err) {
        //    var ret = {
        //        filename: data.file.hapi.filename,
        //        headers: data.file.hapi.headers
        //    };
        //    reply(JSON.stringify(ret));
        //})
    Service.crudQueries.update(MODEL.userDetailsModel,
        {loginToken: token, isDeleted: false},
        {$set: {profilePic: path}},
        {lean: true},
        function (err, result) {
            if (err)
                return callbackRoute(responseObject(SWAGGER_RESPONSE[6].message, {},
                    STATUS_CODE.SERVER_ERROR));
            else {
                if (result.n)
                    return callbackRoute(null, responseObject(SUCCESS_RESPONSE.ACTION_COMPLETE, {},
                        STATUS_CODE.OK));
                return callbackRoute(null, responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                    STATUS_CODE.UNAUTHORIZED));
            }
        })
    }
    else
    {
        return callbackRoute(responseObject(ERROR_RESPONSE.I))
    }
};

/*--------------------------------------------------------------------------------
 *                                   DISPLAY TWEET COUNT
 * --------------------------------------------------------------------------------
 **/
var displayTweetCount = function(token,dates,callbackRoute)
{
    async.waterfall([
        function(callback)
        {
            Service.crudQueries.getCount(MODEL.userDetailsModel,
                {loginToken : token , timestamp : {$gte : dates.fromDate , $lte : dates.toDate}},
                function(err,result){
                    if(err) {
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                            STATUS_CODE.SERVER_ERROR));
                    }
                    else
                    {

                        if(result)
                        {
                            callback(null,result);
                        }
                        else
                        {
                            callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                                STATUS_CODE.UNAUTHORIZED))
                        }
                    }
                })
        }
    ],function(err,result){
        if(err)
        {
            return callbackRoute(err)
        }
        else
        {
            return callbackRoute(null,result)
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
    seeProfile:seeProfile,
    displayTweetCount : displayTweetCount,
    uploadPic : uploadPic,
    re_TweetLogic : re_TweetLogic,
    likeTweet : likeTweet
}