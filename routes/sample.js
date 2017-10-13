module.exports = function (app) {
    var express = require('express');
    var router = express.Router();
    var $q = require('q');
    /* GET users listing. */
    router.get('/', function (req, res) {
        return res.end(JSON.stringify(
            [
                {
                    "name": "Sample 1",
                    "id": 1,
                    "entityType": "Sample"
                },
                {
                    "name": "Sample 2",
                    "id": 2,
                    "entityType": "Sample"
                },
                {
                    "name": "Sample 3",
                    "id": 3,
                    "entityType": "Sample"
                },
                {
                    "name": "Sample 4",
                    "id": 4,
                    "entityType": "Sample"
                },
                {
                    "name": "Sample 5",
                    "id": 5,
                    "entityType": "Sample"
                }
            ]
        ));
    });

    return router;
}
