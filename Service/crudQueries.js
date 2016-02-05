'use strict';

var saveData = function(model,data,callback){
    new model(data).save(function(err,result){
        if(err)
        {
            console.log('get data',err);
            return callback(err);
        }
        callback(null,result)
    })
};

var getData = function (model, query, projection, options, callback) {

    model.find(query, projection, options, function (err, data) {
        if (err) {
            console.log("Get Data", err);
            return callback(err);
        }
        return callback(null, data);
    });
};

var findOneWithLimit = function (model, query, projection, options, callback) {

    model.find(query, projection, options, function (err, data) {
        if (err) {
            console.log("Get Data", err);
            return callback(err);
        }
        return callback(null, data);
    }).limit(1);
};

var findOne = function (model, query, projection, options, callback) {

    model.findOne(query, projection, options, function (err, data) {
        if (err) {
            console.log("Get Data", err);
            return callback(err);
        }
        return callback(null, data);
    });
};

var getOneData = function (model, conditions, update, options, callback) {
    model.findOneAndUpdate(conditions, update, options, function (error, result) {
        if (error) {
            console.log("Find one and update", error);
            return callback(error);
        }
        return callback(null, result);
    })
};

var update = function (model, conditions, update, options, callback) {
    model.update(conditions, update, options, function (err, result) {

        if (err) {
            console.log("Update Query: ", err);
            return callback(err);
        }
        return callback(null, result);

    });
};

/*------------------------------------------------------------------------
* FIND WITH REFERENCE
* -----------------------------------------------------------------------*/
var getDataWithReference = function (model, query, projection, options, collectionOptions, callback) {
    model.find(query, projection, options).populate(collectionOptions).exec(function (err, data) {

        if (err) {
            console.log("Error Data reference: ", err);
            return callback(err);
        }
        return callback(null, data);

    });
};

module.exports = {
    saveData : saveData,
    getData : getData,
    update : update,
    findOne: findOne,
    findOneWithLimit : findOneWithLimit,
    getOneData : getOneData,
    getDataWithReference : getDataWithReference
}