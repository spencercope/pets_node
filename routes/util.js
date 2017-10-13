module.exports = function (app) {
    var express = require('express');
    var router = express.Router();

    router.get('/getIp', getIp);

    return router;

    /**
     * Helper Functions
     */
    function getIp(req, res) {
        res.send({
            ipAddress: req.ip
        })
    }
};
