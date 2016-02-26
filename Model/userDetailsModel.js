'use strict';

var mongoose = require( 'mongoose' );

/*-------------------------------------------------
USER SCHEMA
* ------------------------------------------------*/
var user = new mongoose.Schema({
    name: {type : String,unique:true},
    password: {type : String},
    profilePic : {type: String},
    email: {type :String},
    timeOfRegistration : {type : Date},
    phoneNo: {type : String},
    token : {type : String},
    isDeleted : {type: Boolean, default:false},
    isVerified :{type:Boolean, default :false},
    loginToken : {type:String,unique:true,sparse:true},
    followers : {type : Array },
    following : {type : Array }
});
module.exports  = mongoose.model('userDetailsModel', user);
