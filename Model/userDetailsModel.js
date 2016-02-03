'use strict';

var mongoose = require( 'mongoose' );

/*-------------------------------------------------
USER SCHEMA
* ------------------------------------------------*/
var user = new mongoose.Schema({
    name: {type : String,unique:true},
    password: {type : String},
    email: {type :String},
    phoneNo: {type : String},
    token : {type : String},
    isVerified :{type:Boolean, default :false},
    loginToken : {type:String,unique:true,sparse:true},
    followers : {type : Array },
    following : {type : Array }
});
module.exports  = mongoose.model('userDetailsModel', user);
