'use strict';

var mongoose = require( 'mongoose' );
var twitterSchema = new mongoose.Schema({
    id : {type : mongoose.Schema.ObjectId, ref : 'userDetailsModel'},
    visibility : {type: String},
    isTweetDeleted : {type:Boolean , default:false},
    tweet : {type : String},
    timestamp : {type: Date}
});
module.exports = mongoose.model('twitterModel',twitterSchema);
