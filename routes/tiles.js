module.exports = function (app) {
    var express = require('express');
    var router = express.Router();
    var models = require('../models');

    router.get('/getAll', app.passport.authenticate('bearer', {session: false}), getAll);
    router.post('/createEntity/', app.passport.authenticate('bearer', {session: false}), createEntity);
    router.post('/update/:id', app.passport.authenticate('bearer', {session: false}), update);
    router.get('/testThings/test', testThings);

    return router;

    /**
     * Helper Functions
     */
    function testThings(req, res) {
        console.log("testThings" + new Date());
        res.send({
            test:"things",
            ip: req.ip
        })
    }

    function createEntity(req, res) {
        models.Tile.createEntity(req.body, function (err, thing) {
            res.send(thing);
        });
    }

    function getAll(req, res) {
        models.Tile.getAll(req.user.id, function (err, tiles) {
            res.send(tiles);
        });
    }

    function update(req, res) {
        console.log(req.ip);
        models.Tile.findAndUpdate(req.body, function (err, tile) {
            res.send(tile);
        });
    }
};
