/**
 * Created by anmol on 12/1/16.
 */
var async = require('async'),
    CONFIG = require('../Config'),
    SERVICE = require('../Service'),
    MODEL = require('../Model');
//=---------------------------
// Quicksort
//------------------------------
function quickSort(temp) {

    var arr = [];
    for(var i = 0;i<temp.length;i++)
    {
        arr.push(temp[i]);
    }
    left = 0;
    right = arr.length - 1;

    calling(arr,left,right);

    function calling(arr,left,right)
    {
        var Index = partition(arr, left, right);

        if (left < Index - 1) {
            calling(arr, left, Index - 1);
        }

        if (Index < right) {
            calling(arr, Index, right);
        }
    }

    function partition(arr,left,right)
    {
        var i=left;
        var j=right;
        while (i < j)
        {
            var pivot = arr[i];
            while (arr[j] > pivot) {
                j--;
            }
            while (arr[i] < pivot) {
                i++;
            }
            swap(arr, i, j);
        }
        i++;
        return i;
    }

    function swap(array, indexA, indexB)
    {
        var temp = array[indexA];
        array[indexA] = array[indexB];
        array[indexB] = temp;
    }
    return arr;
}
/*
* ------------------------------------------------
* Sorting function
* ------------------------------------------------
* */
exports.sorting = function (id,input,callbackRoute)
{async.waterfall([
    function (callback) {
        SERVICE.crudQueries.saveData(MODEL.arrayModel, {
            id: id,
            array: input
        }, callback)
    },
    function (result, callback) {
        SERVICE.crudQueries.getOneData(MODEL.arrayModel, null, {$set: {array: quickSort(result.array)}}, null, callback)
    }
], function (err, result) {
    if (err) {
        return callbackRoute(err)
    }
    else {
        return callbackRoute(null,MODEL.arrayModel.find());
    }
})
}
/*
* -------------------------------------------------------------------------
* Searching
* -------------------------------------------------------------------------
* */

exports.search = function (element,callbackRoute)
{
    async.waterfall([
        function (callback) {
            SERVICE.crudQueries.getData(MODEL.arrayModel, {array: {$in: [element]}}, {
                array: 1,
                _id: 0
            }, {lean: true}, callback)
        }
    ], function (err, result) {
        if (err) {
            return callbackRoute(err);
        }
        else {
            if (result.length)
                return callbackRoute(null,result[0].array.indexOf(element));
            else
                return callbackRoute(null,'element not found');
        }
    })
}

/*
 * -------------------------------------------------------------------------
 * Deletion
 * -------------------------------------------------------------------------
 * */
exports.deletion = function(id,num,callbackRoute){
    async.waterfall([
        function (callback) {
            SERVICE.crudQueries.update(MODEL.arrayModel, {id: id}, {$pull: {array: num}}, {lean: true}, callback);
        }

    ], function (err, result) {
        if (err) {
            return callbackRoute(err);
        }
        else {
            return callbackRoute(null,result);
        }
    })
}
/*
 * -------------------------------------------------------------------------
 * Concatenate
 * -------------------------------------------------------------------------
 * */
exports.concatenation = function (id,arr2,callbackRoute){
    async.waterfall([
        function (callback) {
            SERVICE.crudQueries.update(MODEL.arrayModel, {id: id}, {$push: {array: {$each: arr2}}}, {lean: true}, callback)

        }
    ], function (err, result) {
        if (err) {
            return callbackRoute(err);
        }
        else {
            return callbackRoute(null,result);
        }
    })
}