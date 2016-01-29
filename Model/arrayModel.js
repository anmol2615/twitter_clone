'use strict';

var mongoose = require( 'mongoose' );
var ARR = new mongoose.Schema({
    id : {type: Number},
    array: {type : Array}
});
var arrayModel = mongoose.model('arrayModel',ARR);
module.exports = [
    arrayModel
]