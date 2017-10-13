module.exports = function (app) {
    var express = require('express');
    var router = express.Router();
    var $q = require('q');
    /* GET users listing. */
    router.get('/', function (req, res) {
        return res.end('Public Area');
    });

    return router;
}
