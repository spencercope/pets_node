"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var lodash    = require('lodash');
var config    = require(__dirname + '/../config/config.js');
config.logging = false; //logging for sequelize
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db        = {};
fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js')
    })
    .forEach(function(file) {
        var model;
        model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model

    });

Object.keys(db).forEach(function(modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db)
    }
});

module.exports = lodash.extend({
    sequelize: sequelize,
    Sequelize: Sequelize,
}, db);
