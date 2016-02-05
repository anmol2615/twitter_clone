/**
 * Created by anmol on 3/2/16.
 */
'use strict';

var mongoose = require( 'mongoose');

/*-------------------------------------------------
 ADMIN SCHEMA
 * ------------------------------------------------*/
var adminModel = new mongoose.Schema({
    adminName: {type : String,unique:true},
    password: {type : String},
    email: {type :String},
    phoneNo: {type : String},
    token : {type : String},
    scope : {type : String},
    isVerified :{type:Boolean, default :false},
    loginToken : {type:String,unique:true,sparse:true}
});
module.exports  = mongoose.model('adminModel', adminModel);
