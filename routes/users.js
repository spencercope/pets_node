module.exports = function (app) {
    var express = require('express');
    var router = express.Router();
    var md5 = require('md5');
    var $q = require('q');
    var models = require('../models');

    /**
     * @api {post} /users Create a new user
     * @apiVersion 0.0.1
     * @apiName CreateUser
     * @apiGroup User
     *
     * @apiParam {String} username  Username of new user.
     * @apiParam {String} password   Password of new user.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "user": {
     *          "id": "1",
     *          "username": "jsmith",
     *          "password": "testPass"
     *       }
     *     }
     */

    router.post('/', app.passport.authenticate('bearer', {session: false}), [createUserCheck, createUser]);

    /**
     * @api {get} /portalHome
     * @apiName GetPortalHome
     * @apiGroup PortalHome
     *
     * @apiHeader (HeaderGroup) {Object} authorization Authorization value.
     * @apiHeaderExample {json} Header-Example:
     *     {
     *       "Authorization": "Bearer TxOqmA4pPcCrTLM3rizY4JpvOkm4kgm3mSSgqKmNkWiEVIjHrgw5ZNkKeIOTgScEUBGiWnyqLBDPJDGJWasJ37srlht4f6Ny9iexAt"
     *     }
     *
     * @apiSuccess {Object[]} data An array of entities to be stored in the breeze cache.
     *
     */

    router.get('/current', app.passport.authenticate('bearer', {session: false}), [readOwnUserCheck, getCurrentUser]);
    // router.get('/:id', app.passport.authenticate('bearer', {session: false}), [readOwnUserCheck, getUser]);
    // router.get('/current/getAllUsers', app.passport.authenticate('bearer', {session: false}), [readOwnUserCheck, getAllUsers]);
    router.get('/getAll', app.passport.authenticate('bearer', {session: false}), [getAll]);
    router.post('/createEntity/', app.passport.authenticate('bearer', {session: false}), createEntity);
    router.post('/update/please', app.passport.authenticate('bearer', {session: false}), findAndUpdate);
    router.get('/getAllLoginStats/', app.passport.authenticate('bearer', {session: false}), getAllLoginStats);
    router.get('/session/', app.passport.authenticate('bearer', {session: false}), checkSession);
    // router.get('/current/getUserRoles', app.passport.authenticate('bearer', {session: false}), getUserRoles);
    // router.get('/current/getUsernames', getAllUsernames);


    router.post('/login', app.passport.authenticate('local', {session: false}), function (req, res) {
        var models = require('../models');
        var accessToken = md5("" + Math.random());
        console.log("DEBUG req: " + JSON.stringify(req.user) + " Adding token: " + accessToken);
        models.AccessToken.saveAccessToken(accessToken, req.user.id, function () {
            console.log(req.user.username + ' logged in from ' + req.ip);
            createLoginStats(req.ip, req.user.username);
            res.statusCode = 200;
            res.set('token', accessToken);
            req.user.accessToken = accessToken;
            res.json(req.user);
        });
    });

    router.post('/setPassword/:id', app.passport.authenticate('bearer', {session: false}), [readOwnUserCheck, setUserPassword]);

    return router;

    /**
     * Helper Functions
     */
    function getAll(req, res) {
        models.User.getAll(function (err, things) {
            res.send(things);
        });
    }
    function createEntity(req, res) {
        models.User.createEntity(req.body, function (err, thing) {
            res.send(thing);
        });
    }
    function findAndUpdate(req, res) {
        models.User.findAndUpdate(req.body, function (err, user) {
            res.send(user);
        });
    }

    function createLoginStats(ip, username){
        models.LoginStats.createEntity(ip, username, function (res) {
            console.log("created stat");
        });
    }

    function checkSession(req, res){
        res.send(req.user);
    }

    function getAllLoginStats(req, res) {
        models.LoginStats.getAll(function (err, result) {
            res.send(result);
        });
    }

    function getUserRoles(req, res) {
        var models = require('../models');
        models.User.getAll( function (err, users) {
            var responseObj = [];
            var promiseArr = [];
            var userObject = {};
            users.forEach(function (user) {
                var deferred = $q.defer();
                promiseArr.push(deferred.promise);

                user.getRolePermissionsObjects(function (err, rolePermissions) {
                    user.password = "";//for some reason neither delete user.password or delete user['password'] work
                    userObject = {
                        user: user,
                        rolePermissions: {}
                    };

                    userObject.rolePermissions = rolePermissions;
                    responseObj.push(userObject);
                    deferred.resolve();
                });
                $q.all(promiseArr).then(function() {
                    return res.send(JSON.stringify(responseObj));
                }).catch(function(err) {
                    console.log(err);
                    return err;
                });
            });
        });
    }

    function getAllUsernames(req, res) {
        var models = require('../models');
        models.User.getAll( function (err, users) {
           var usernameArray = [];
           for(var i = 0; i < users.length; i++){
               usernameArray.push(
                   users[i].username
               );
           }
           res.send(usernameArray);
        });
    }

    function createUserCheck(req, res, next) {
        if (req.authInfo.scope.indexOf('createUsers') == -1) {
            res.statusCode = 403;
            return res.end('Forbidden');
        }
        next();
    }

    function readOwnUserCheck(req, res, next) {
        // console.log(JSON.stringify(req.user));
        // if (req.authInfo.scope.indexOf('readOwnUser') == -1) {
        //     res.statusCode = 403;
        //     return res.end('Forbidden');
        // }
        next();
    }

    function createUser(req, res) {
        var models = require('../models');
        //Bug fix for when POST data is empty so that it doesn't persist in the DB
        if ((typeof req.param('username') != 'undefined') && (typeof req.param('password') != 'undefined')) {
            console.log(req.param('username'));
            models.User.findOrCreate({
                where: {
                    username: req.param('username'),
                    password: req.param('password')
                }
            }).spread(function (user, created) {
                if (created) {
                    console.log('created new user');
                    res.send(user);
                } else {
                    res.send('user already exists');
                }
            })
        } else {
            res.send('Username or password cannot be NULL');
        }
    }

    function getCurrentUser(req, res) {
        function sendUserInfo(user) {
            res.json({
                user : {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                entityType: 'User',
                permissions: req.authInfo.scope,
                resetRequired: user.resetRequired
                },
                //rolePermissions : user.rolePermissions
            });
        }

        var models = require('../models');
        if (req.user.username) {
            models.User.getUser(req.user.id, function(err, user) {
                if (user) {
                    //user.getRolePermissionsObjects(function (err, rolePermissions) {
                        //user.rolePermissions = rolePermissions;
                        //sendUserInfo(user);
                    //});
                } else {
                    res.statusCode = 404;
                    res.end();
                }
            });
        } else {
            var authHeader = req.headers.authorization.split(' ');
            var token = authHeader[1];
            models.AccessToken.getAccessToken(token, function (err, tokenObj) {
                if (tokenObj) {
                    var userId = tokenObj.userId;
                    models.User.getUser(userId, function(err, user) {
                        if (user) {
                            user.getRolePermissionsObjects(function (err, rolePermissions) {
                                user.rolePermissions = rolePermissions;
                                sendUserInfo(user);
                            });
                        } else {
                            res.statusCode = 404;
                            res.end();
                        }
                    });
                }
            });
        }
    }

    // function getUser(req, res) {
    //     var authHeader = req.headers.authorization.split(' ');
    //     var token = authHeader[1];
    //     var models = require('../models');
    //     models.AccessToken.getAccessToken(token, function (err, tokenObj) {
    //         models.User.getUser(req.params.id, function (err, user) {
    //             //for non-admins, only view their own user info
    //             if ((req.authInfo.scope.indexOf('readUsers') == -1) && (tokenObj.userId !== parseInt(user.id))) {
    //                 res.statusCode = 403;
    //                 return res.end('Forbidden');
    //             } else {
    //                 var responseObj = {
    //                     user: user,
    //                     entityType: 'User',
    //                     permissions: []
    //                 };
    //                 return res.send(JSON.stringify(responseObj));
    //             }
    //         });
    //     });
    // }

    // function getAllUsers(req, res) {
    //     var authHeader = req.headers.authorization.split(' ');
    //     var token = authHeader[1];
    //     var models = require('../models');
    //     models.AccessToken.getAccessToken(token, function (err, tokenObj) {
    //         models.User.getAll( function (err, users) {
    //             if ((req.authInfo.scope.indexOf('readUsers') == -1)) {
    //                 res.statusCode = 403;
    //                 return res.end('Forbidden');
    //             }else{
    //                 var responseObj = [];
    //                 var promiseArr = [];
    //                 var userObject = {};
    //                 users.forEach(function (user) {
    //                     var deferred = $q.defer();
    //                     promiseArr.push(deferred.promise);
    //
    //                     user.getRolePermissionsObjects(function (err, rolePermissions) {
    //                         user.password = "";//for some reason neither delete user.password or delete user['password'] work
    //                         userObject = {
    //                             user: user,
    //                             rolePermissions: {}
    //                         };
    //
    //                         userObject.rolePermissions = rolePermissions;
    //                         responseObj.push(userObject);
    //                         deferred.resolve();
    //                     });
    //                 });
    //                 $q.all(promiseArr).then(function() {
    //                     return res.send(JSON.stringify(responseObj));
    //                 }).catch(function(err) {
    //                     console.log(err);
    //                     return err;
    //                 });
    //             }
    //         });
    //     });
    // }

    function setUserPassword(req, res) {
        var models = require('../models');
        var util = require('../utils');
        var userId = req.params.id;
        if (!userId) {
            userId = req.user.id;
        }
        models.User.getUser(userId, function(err, dbUser) {
            var canUpdateWithoutOldPass = false;
            var i;
            for (var i = 0; i < req.authInfo.scope.length; i++) {
                if (req.authInfo.scope[i] == "createUsers") {
                    canUpdateWithoutOldPass = true;
                }
            }
            if (!err) {
                var newPassword = req.body.newPassword;
                var oldPassword = req.body.oldPassword;
                if (!newPassword && !canUpdateWithoutOldPass) {
                    var jsonBody = JSON.parse(req.body.toString());
                    newPassword = jsonBody.newPassword;
                    oldPassword = jsonBody.oldPassword;
                    if (!newPassword) {
                        res.json({
                            'status': 'failed',
                            'message': 'No new password specified.'
                        });
                        return;
                    }
                }
                if ((dbUser.password == oldPassword) || (canUpdateWithoutOldPass && (!oldPassword || oldPassword == ""))) {
                    if(canUpdateWithoutOldPass  && (!oldPassword || oldPassword == "")) {
                        newPassword = 'SnowFighter1';//reset
                        dbUser.update({
                            password: md5(newPassword),
                            resetRequired: true
                        }).then(function() {
                            res.json({
                                'status': 'success',
                                'message': 'Password updated'
                            });
                        });
                    }else {
                        dbUser.update({
                            password: newPassword,
                            resetRequired: false
                        }).then(function() {
                            res.json({
                                'status': 'success',
                                'message': 'Password updated'
                            });
                        });
                    }
                } else if(canUpdateWithoutOldPass  && (!oldPassword || oldPassword == "")) {
                    dbUser.update({
                        password: newPassword,
                        resetRequired: true
                    }).then(function() {
                        res.json({
                            'status': 'success',
                            'message': 'Password updated'
                        });
                    });
                }else {
                    res.json({
                        'status': 'failed',
                        'message': 'Old password is incorrect.'
                    });
                }
            } else {
                res.json({
                    'status': 'failed',
                    'message': err
                });
            }
        });
    }
};
