/**
 * Created by anmol on 3/2/16.
 */
'use strict';

var async = require('async'),
    MODEL = require('../Model'),
    CONFIG = require('../Config'),
    moment = require('moment'),
    responseObject = CONFIG.USER_DATA.responseObject,
    ERROR_RESPONSE = CONFIG.RESPONSE_MESSAGES.ERROR_MESSAGES,
    SUCCESS_RESPONSE = CONFIG.RESPONSE_MESSAGES.SUCCESS_MESSAGES,
    SWAGGER_RESPONSE = CONFIG.RESPONSE_MESSAGES.SWAGGER_DEFAULT_RESPONSE_MESSAGES,
    STATUS_CODE = CONFIG.CONSTANTS.STATUS_CODE,
    Service = require('../Service');
//---------------------------------------------------------------------------------
//                                    SAVE USER
//---------------------------------------------------------------------------------
var adminRegister = function(name,password,email,phoneNo,scope,callbackAdminRegister)
{
    async.waterfall([
        function(callback)
        {
            Service.crudQueries.saveData(MODEL.adminModel,{
                adminName: name,
                password : CONFIG.CRYPTO.encrypt(password),
                email : email,
                phoneNo : phoneNo,
                scope:scope,
                token: CONFIG.USER_DATA.cipherToken(email)
            },callback)
        }
    ],function(err,result){
        if(err){
            if(err.code === 11000) {
                return callbackAdminRegister(responseObject(ERROR_RESPONSE.USERNAME_ALREADY_EXISTS,
                    {},STATUS_CODE.ALREADY_EXISTS_CONFLICT))
            }
            return callbackAdminRegister(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                STATUS_CODE.SERVER_ERROR));
        }
        else {
            Service.mailVerification.sendLink(email,CONFIG.USER_DATA.cipherToken(email),scope);
            return callbackAdminRegister(null, responseObject(SUCCESS_RESPONSE.REGISTRATION_SUCCESSFUL,
                {},STATUS_CODE.OK));
        }
    })
};
//---------------------------------------------------------------------------------
//                                    CLICK_TO_VERIFY
//---------------------------------------------------------------------------------
var clickToVerify = function(token,callbackAdminRegister)
{
    Service.crudQueries.getOneData(MODEL.adminModel,{token : token},{$set : {isVerified:true}},{lean:true},function(err, result){
        if(err)
            return callbackAdminRegister(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                STATUS_CODE.SERVER_ERROR));
        else
        {
            return callbackAdminRegister(null,responseObject(SUCCESS_RESPONSE.EMAIL_VERIFIED,{},
                STATUS_CODE.OK))}
    })

};

//---------------------------------------------------------------------------------
//                                    ADMIN_LOGIN
//---------------------------------------------------------------------------------
var adminLoginLogic = function(name,password,callbackAdminLogin) {
    var encryptedPassword = CONFIG.CRYPTO.encrypt(password);
    async.waterfall([
        function(callback){
            Service.crudQueries.getData(MODEL.adminModel,
                {adminName : name, password:encryptedPassword,isVerified : true},{_id:1,loginToken : 1},{lean:true},
                function(err,result) {
                    if (err) {
                        return callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                            STATUS_CODE.SERVER_ERROR));
                    }
                    else {
                        if(result)
                            return callback(null,result);
                        else
                        {
                            return callback(responseObject(ERROR_RESPONSE.ACCESS_DENIED,{},
                                STATUS_CODE.UNAUTHORIZED));}

                    }
                })
        },function(result,callback){
            var auth = CONFIG.USER_DATA.cipherToken(result[0]._id);
            if(!result[0].loginToken){
                Service.crudQueries.update(MODEL.adminModel,
                    {adminName : name, password:encryptedPassword,isVerified : true},
                    {$set: {loginToken: auth}},
                    function(err,result) {
                        if (err) {
                            return callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                                STATUS_CODE.SERVER_ERROR));
                        }
                        else {
                                return callback(responseObject(SUCCESS_RESPONSE.LOGIN_SUCCESSFULLY,auth,
                                    STATUS_CODE.OK));
                        }
                    })
            }
            else {
                return callback(responseObject(ERROR_RESPONSE.USER_ALREADY_LOGGED_IN,{},
                    STATUS_CODE.ALREADY_EXISTS_CONFLICT));
            }
        }],function(err,result){
        if(err)
            callbackAdminLogin(err);
        else
            callbackAdminLogin(null,result);
    })
};
//---------------------------------------------------------------------------------
//                                    ADMIN_LOGOUT
//---------------------------------------------------------------------------------
var adminLogoutLogic = function(token,callbackLogoutLogic){
    Service.crudQueries.update(MODEL.adminModel,
        {loginToken : token},
        {$unset : {loginToken : 1}},
        {lean:true},
        function(err,result)
        {
            if(err)
                return callbackLogoutLogic (responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                    STATUS_CODE.SERVER_ERROR));
            else{
                if(result.n)
                    return callbackLogoutLogic(null,responseObject(SUCCESS_RESPONSE.LOGOUT_SUCCESSFULLY,{},
                        STATUS_CODE.OK));
                return callbackLogoutLogic(null,responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                    STATUS_CODE.UNAUTHORIZED));
            }
        })
};
//---------------------------------------------------------------------------------
//                                    SEE_USER_PROFILE
//---------------------------------------------------------------------------------
var seeUserProfile = function(token,name,callbackRoute)
{
    async.auto({
        authorize : function(callback)
        {
            Service.crudQueries.findOneWithLimit(MODEL.adminModel,
                {loginToken : token},
                {},
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
        getUser : ['authorize',function(callback,result){
            Service.crudQueries.findOneWithLimit(MODEL.userDetailsModel,
                {name : name},
                {password:0},
                {lean : true},function(err,result){
                    if(err)
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                            STATUS_CODE.SERVER_ERROR));
                    else
                    {
                        if(result.length)
                        {
                            callback(null,result)
                        }
                        else
                        {
                            callback(responseObject(ERROR_RESPONSE.USER_NOT_FOUND,{},
                        STATUS_CODE.NOT_FOUND))}
                    }
                })
        }],
        getTweetsToo : ['getUser',function(callback,result){
            Service.crudQueries.getData(MODEL.twitterModel,
                {id : result.getUser[0]._id},
                {},
                {lean : true},function(err,result){
                    if(err)
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                            STATUS_CODE.SERVER_ERROR))
                    else
                    {
                        callback(null,result);
                    }
                })
        }
    ]},
        function(err,result){
            if(err)
        {
            return callbackRoute(err)
        }
        else
        {
            return callbackRoute(null,responseObject(SWAGGER_RESPONSE[0].message,{USER_INFO : result.getUser[0],
            TWEETS : result.getTweetsToo},STATUS_CODE.OK))
        }
    })
};
//---------------------------------------------------------------------------------
//                                    EDIT_SOME_USER
//---------------------------------------------------------------------------------
var editUserProfile = function(token,payload,callbackEditProfile){
    async.waterfall([
        function(callback){
            Service.crudQueries.findOneWithLimit(MODEL.adminModel,{loginToken : token},
                {},
                {lean:true},function(err,result){
                    if(err)
                    callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                    STATUS_CODE.SERVER_ERROR));
                    else
                    {
                        if(result.length)
                        callback(null,result);
                        else
                        callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS,{},
                        STATUS_CODE.SERVER_ERROR))
                    }
                })
        },
        function(result,callback) {
            if(payload.email){
                Service.crudQueries.update(MODEL.userDetailsModel, {name: payload.searchName, isDeleted: false},
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
                                callback(responseObject(ERROR_RESPONSE.USER_NOT_FOUND,{},
                                    STATUS_CODE.BAD_REQUEST))
                        }

                    });

            }
            else
            {
                Service.crudQueries.update(MODEL.userDetailsModel,{name:payload.searchName , isDeleted : false},
                    {$set : payload},{lean:true}, function(err,result){
                        if (err)
                            callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                                STATUS_CODE.SERVER_ERROR));
                        else {
                            if(result.n) {
                                callback(null, responseObject(SUCCESS_RESPONSE.DETAILS_UPDATED,{},
                                    STATUS_CODE.CREATED));
                            }
                            else
                                callback(responseObject(ERROR_RESPONSE.USER_NOT_FOUND,{},
                                    STATUS_CODE.BAD_REQUEST))
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
//---------------------------------------------------------------------------------
//                                    DELETE_TWEET
//---------------------------------------------------------------------------------
var deleteTweet = function(token,tweetId,callbackRoute)
{
    async.auto({
            authorize : function(callback)
            {
                Service.crudQueries.findOneWithLimit(MODEL.adminModel,
                    {loginToken : token},
                    {},
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
            deleteTweet : ['authorize',function(callback,result){
                if(result.authorize.length){
                Service.crudQueries.update(MODEL.twitterModel,
                    {_id : tweetId},
                    {$set : {isTweetDeleted : true}},
                    {lean : true},function(err,result){
                        if(err)
                            callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                                STATUS_CODE.SERVER_ERROR));
                        else
                        {
                            if(result.n)
                            {
                                callback(null,responseObject(SUCCESS_RESPONSE.DELETED,{},
                                STATUS_CODE.OK));
                            }
                            else
                            {
                                callback(responseObject(ERROR_RESPONSE.TWEET_NOT_FOUND,{},
                                    STATUS_CODE.NOT_FOUND))}
                        }
                    })}
                else
                    callback(responseObject(ERROR_RESPONSE.USER_NOT_FOUND,{},
                        STATUS_CODE.NOT_FOUND));
            }]
    },
        function(err,result){
            if(err)
            {
                return callbackRoute(err)
            }
            else
            {
                return callbackRoute(null,result.deleteTweet);
            }
        })
};
//---------------------------------------------------------------------------------
//                                    DELETE_USER
//---------------------------------------------------------------------------------
var deleteUser = function(token,name,callbackRoute)
{
    async.auto({
            authorize : function(callback)
            {
                Service.crudQueries.findOneWithLimit(MODEL.adminModel,
                    {loginToken : token, scope : 'SUPER_ADMIN'},
                    {_id:1},
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
            deleteUser : ['authorize',function(callback,result){
                if(result.authorize.length){
                    Service.crudQueries.getOneData(MODEL.userDetailsModel,
                        {name: name },
                        {$set : {isDeleted : true},$unset : {loginToken:1}},
                        {lean : true},function(err,result){
                            if(err)
                                callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                                    STATUS_CODE.SERVER_ERROR));
                            else
                            {
                                if(result)
                                {
                                    callback(null,responseObject(SUCCESS_RESPONSE.DELETED,{},
                                        STATUS_CODE.OK));
                                }
                                else
                                {
                                    callback(responseObject(ERROR_RESPONSE.TWEET_NOT_FOUND,{},
                                        STATUS_CODE.NOT_FOUND))}
                            }
                        })}
                else
                    callback(responseObject(ERROR_RESPONSE.USER_NOT_FOUND,{},
                        STATUS_CODE.NOT_FOUND));
            }],
            deleteNameFromFollowing : ['deleteUser',function(callback,result){
                    Service.crudQueries.update(MODEL.userDetailsModel,
                        {following: {  $in : [result.deleteUser.response.data._id]}},
                        {$pull : {following : result.deleteUser.response.data._id}},
                        {lean : true , multi :true},function(err,result){
                            if(err)
                                callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                                    STATUS_CODE.SERVER_ERROR));
                            else
                            {
                                if(result.n)
                                {
                                    callback(null,responseObject(SUCCESS_RESPONSE.DELETED,{},
                                        STATUS_CODE.OK));
                                }
                                else
                                {
                                    callback(null,responseObject(ERROR_RESPONSE.NO_FOLLOWERS,{},
                                        STATUS_CODE.NOT_FOUND))}
                            }
                        })
            }],
            deleteNameFromFollowers : ['deleteUser',function(callback,result){
                Service.crudQueries.update(MODEL.userDetailsModel,
                    {followers: {  $in : [result.deleteUser.response.data._id]}},
                    {$pull : {followers : result.deleteUser.response.data._id}},
                    {lean : true , multi :true},function(err,result){
                        if(err)
                            callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                                STATUS_CODE.SERVER_ERROR));
                        else
                        {
                            if(result.n)
                            {
                                callback(null,responseObject(SUCCESS_RESPONSE.DELETED,{},
                                    STATUS_CODE.OK));
                            }
                            else
                            {
                                callback(null,responseObject(ERROR_RESPONSE.NOT_FOLLOWING_ANYONE,{},
                                    STATUS_CODE.NOT_FOUND))}
                        }
                    })
            }]
        },
        function(err,result){
            if(err)
            {
                return callbackRoute(err)
            }
            else
            {
                return callbackRoute(null,result.deleteUser);
            }
        })
};
/*---------------------------------------------------------------
*                        NO OF USERS REGISTERED
* ---------------------------------------------------------------
* */
var getUserCount = function(token,dates,callbackRoute)
{
    async.waterfall([
        function(callback)
        {
            Service.crudQueries.findOneWithLimit(MODEL.adminModel,
                {loginToken : token},
                {_id:1},
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
            Service.crudQueries.getCount(MODEL.userDetailsModel,
                {timeOfRegistration : {$gte : dates.fromDate , $lte : dates.toDate}},
                function(err,result){
                    if(err)
                        callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG,{},
                            STATUS_CODE.SERVER_ERROR));
                    else
                        callback(null,responseObject(SWAGGER_RESPONSE[0].message,result,
                            STATUS_CODE.OK));
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
 *                                   NUMBER OF USERS AT ONCE
 * --------------------------------------------------------------------------------
 **/
var wholeUsersTogether = function(token,callbackRoute) {
    async.auto({
        authorize:  function (callback) {
            Service.crudQueries.findOneWithLimit(MODEL.adminModel,
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
        getUserCount: ['authorize',function (callback,result) {
            if(result.authorize.length){
                var currentDate = new Date();
                Service.crudQueries.aggregateData(MODEL.userDetailsModel,
                    [
                        {
                            $group : {
                                _id: {
                                    "day": {
                                        "$dayOfMonth": "$timeOfRegistration"
                                    },
                                    "year": {
                                        "$year": "$timeOfRegistration"
                                    },
                                    "month": {
                                        "$month": "$timeOfRegistration"
                                    },
                                    "week": {
                                        "$week":"$timeOfRegistration"
                                    }

                                },
                                "count": {
                                    $sum: 1
                                },
                                "minDate": {
                                    $min: "$timeOfRegistration"
                                }
                            }
                        }
                    ],
                    function (err, result) {
                        if (err) {
                            callback(responseObject(ERROR_RESPONSE.SOMETHING_WRONG, err,
                                STATUS_CODE.SERVER_ERROR));
                        }
                        else {
                            var i= 0,
                                dayCount = 0,
                                weekCount = 0,
                                monthCount = 0,
                                yearCount = 0;

                            while(!!result[i] && result[i].minDate.getFullYear() == currentDate.getFullYear())
                            {
                                if(result[i].minDate.getDate() == currentDate.getDate())
                                {
                                    dayCount+=result[i].count;
                                    weekCount = dayCount;
                                }
                                else if(result[i]._id.week == moment(currentDate).format('W'))
                                {
                                    weekCount+=result[i].count;
                                    monthCount = weekCount;
                                }
                                else if(result[i].minDate.getMonth() == currentDate.getMonth())
                                {
                                    monthCount+=result[i].count;
                                    yearCount = monthCount;
                                }

                                else if(result[i].minDate.getFullYear() == currentDate.getFullYear())
                                {
                                    yearCount += result[i].count;
                                }
                                i++;
                            }
                            callback(null,responseObject(SUCCESS_RESPONSE.ACTION_COMPLETE,{dayCount : dayCount,
                                weekCount : weekCount,
                                monthCount : monthCount,
                                yearCount : yearCount},
                                STATUS_CODE.OK));
                        }
                    })
            }
            else {
                callback(responseObject(ERROR_RESPONSE.INVALID_CREDENTIALS, {},
                    STATUS_CODE.UNAUTHORIZED))
            }
        }]
    }, function (err, result) {
        if (err) {
            return callbackRoute(err)
        }
        else {
            return callbackRoute(null, result.getUserCount)
        }
    })
};

module.exports = {
    adminRegister: adminRegister,
    clickToVerify : clickToVerify,
    adminLoginLogic : adminLoginLogic,
    adminLogoutLogic : adminLogoutLogic,
    seeUserProfile : seeUserProfile,
    deleteTweet: deleteTweet,
    deleteUser:deleteUser,
    editUserProfile : editUserProfile,
    getUserCount : getUserCount,
    wholeUsersTogether : wholeUsersTogether
};
