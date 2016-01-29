'use strict';

var mongoose = require( 'mongoose' );
var twitterSchema = new mongoose.Schema({
    id : {type : mongoose.Schema.ObjectId, ref : 'userDetailsModel'},
    visibility : {type: String},
    tweet : {type : String},
    timestamp : {type: Date}
});
module.exports = mongoose.model('twitterModel',twitterSchema);
