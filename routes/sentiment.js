module.exports = function (app) {
    var express = require('express');
    var router = express.Router();
    var sentiment = require('sentiment');

    router.post('/getSentiment', getSentiment);

    return router;

    /**
     * Helper Functions
     */
    function getSentiment(req, res) {
        res.send(sentiment(req.body.data));
    }
};
