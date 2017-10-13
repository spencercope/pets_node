module.exports = function (app) {
    var express = require('express');
    var router = express.Router();
    var $q = require('q');
    router.get('/', function (req, res) {
        var models = require('../models');
        var routeDeferred = $q.defer();

        /**
         * Create Admin User, Roles and Permissions
         */
        var adminDeferred = $q.defer();

        createRole('admin')
            .then(function (role) {
                var permissions = ['editUsers', 'createUsers', 'deleteUsers', 'readUsers', 'editOwnUser', 'readOwnUser'];
                $q.all(addPermissions(permissions, role))
                    .spread(function (results) {
                        adminDeferred.resolve(role);
                    });
            });

        adminDeferred.promise.then(function (role) {
            console.log(role);
            createUserWithRole(role, 'admin', 'admin123')
                .then(function (user) {
                    console.log(user);
                });
        });

        /**
         * Create Regular User, Roles and Permissions
         */
        var regDeferred = $q.defer();

        createRole('user')
            .then(function (role) {
                var permissions = ['editOwnUser', 'readOwnUser'];
                $q.all(addPermissions(permissions, role))
                    .spread(function (results) {
                        regDeferred.resolve(role);
                    });
            });

        regDeferred.promise.then(function (role) {
            console.log(role);
            createUserWithRole(role, 'user', 'user123')
                .then(function (user) {
                    console.log(user);
                    routeDeferred.resolve();
                });
        });

        //when all the work is done
        routeDeferred.promise.then(function () {
            return res.end('Done');
        });

        /**
         * Helper Functions
         */

        function createRole(roleName) {

            var deferred = $q.defer();

            models.Role.findOrCreate({
                where: {name: roleName}
            }).spread(function (role, created) {
                deferred.resolve(role);
            });

            return deferred.promise;
        }

        function addPermissions(permissions, role) {

            var promises = [];

            permissions.forEach(function (permission) {
                var deferred = $q.defer();
                promises.push(deferred.promise);
                models.Permission.findOrCreate({
                    where: {name: permission}
                }).spread(function (permission, created) {
                    role.addPermission(permission);
                    deferred.resolve(permission);
                });
            });

            return promises;
        }

        function createUserWithRole(role, username, password) {

            var deferred = $q.defer();

            models.User.findOrCreate({
                where: {
                    username: username,
                    password: password,
                    entityType: "User"
                }
            }).spread(function (user, created) {
                user.addRole(role);
                deferred.resolve(user);
            });

            return deferred.promise;
        }
    });

    return router;
}
