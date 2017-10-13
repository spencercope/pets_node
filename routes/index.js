module.exports = function (app) {
    var express = require('express');
    var router = express.Router();
    var $q = require('q');
    /* GET home page. */
    router.get('/', function (req, res) {
        return res.end('It Works');
    });

    return router;
};
