'use strict';

var mongoose = require( 'mongoose' );

/*-------------------------------------------------
USER SCHEMA
* ------------------------------------------------*/
var user = new mongoose.Schema({
    name: {type : String},
    password: {type : String},
    email: {type :String},
    phoneNo: {type : String},
    token : {type : String},
    isVerified :{type:Boolean, default :false},
    loginToken : {type:String, default : ''},
    followers : {type : Array },
    following : {type : Array }
});
module.exports  = mongoose.model('userDetailsModel', user);
