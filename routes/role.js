module.exports = function (app) {
    var express = require('express');
    var router = express.Router();

    /* GET roles listing. */
    router.get('/', roles);

    return router;

    // Data Access Functions
    function roles(req, res) {
        var models = require('../models');
        models.Role.getRoles(function (err, entities) {
            res.end(JSON.stringify(entities));
        });
    }
};
