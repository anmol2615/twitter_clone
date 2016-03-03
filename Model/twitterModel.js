'use strict';

var mongoose = require( 'mongoose' );
var twitterSchema = new mongoose.Schema({
    id : {type : mongoose.Schema.ObjectId, ref : 'userDetailsModel'},
    visibility : {type: String , default : 'Public'},
    isTweetDeleted : {type:Boolean , default:false},
    tweet : {type : String},
    likedBy : {type : Array},
    timestamp : {type: Date},
    reTweetedFrom : {type:String , default:null}
});
module.exports = mongoose.model('twitterModel',twitterSchema);
