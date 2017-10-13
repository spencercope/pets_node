module.exports = function(sequelize, DataTypes) {
    var $q = require('q');
    var md5 = require('md5');
    /**
     *  User
     *  @class User
     *  @property {integer} id
     *  @property {string} username
     *  @property {string} password
     *  @property {string} name
     */
    var User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        //entityType: {
          //  type: DataTypes.STRING,
            //defaultValue: 'User'
        //},
        status: {
            type: DataTypes.ENUM('Active','Inactive'),
            defaultValue: 'Active'
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: new Date().toISOString().substring(0, 19).replace('T', ' ')
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: new Date().toISOString().substring(0, 19).replace('T', ' ')
        }
        //resetRequired: {
          //  type: DataTypes.BOOLEAN,
            //defaultValue: true
        //}
    }, {
        tableName: "users",
        setterMethods: {
            password: function (value) {
                if(value != null && value != '' && value != undefined) {
                    this.setDataValue('password', value);
                }
            }
        },
        classMethods: {

            /**
             * Get the user object based on their user ID
             * @memberof User
             * @param userId {integer}
             * @param callback {function}
             */
            getUser : function(userId, callback) {
                User.findById(userId).then(function(user) {
                    if(user == null) {
                        callback('Username and password do not match records in the database.');
                    }else {
                        callback(false, user);
                    }
                }).catch(function(err) {
                    console.log(err);
                    callback(err);
                });
            },
            /**
             * Gets all of the user objects
             * @memberof User
             * @param callback {function}
             */
            getAll : function(callback){
                User.findAll().then(function (users) {
                    callback(false, users);
                }).catch(function (err) {
                    console.log(err);
                    callback(err);
                });
            },
            createEntity : function(entity, callback){
                User.create({
                    username: entity.username,
                    password: entity.password,
                    email: entity.email,
                    status: entity.status,
                    firstName: entity.firstName,
                    lastName: entity.lastName
                }).then(function (user) {
                    callback(false,  user);
                }).catch(function (err) {
                    console.log(err);
                    callback(err);
                });
            },
            findAndUpdate : function(entity, callback) {
                User.update({
                    username: entity.username,
                    password: entity.password,
                    email: entity.email,
                    status: entity.status,
                    firstName: entity.firstName,
                    lastName: entity.lastName
                }, {
                    where: {
                        id: entity.id
                    }
                }).then(function (updatedEntity) {
                    callback(false, updatedEntity)
                }).catch(function (err) {
                    console.log(err);
                });
            },
            /**
             * Get the user object based on their username
             * @memberof User
             * @param username {string}
             * @param callback {function}
             */
            getUserByUsername : function(username, callback) {
                User.findOne({
                    where:  { username: username }
                }).then(function(user) {
                    if(user == null) {
                        callback('Unable to find the username in the database.');
                    }else {
                        callback(false, user);
                    }
                }).catch(function(err) {
                    console.log(err);
                    callback(err);
                });
            },


            getUserFromReqHeader : function(req, callback) {
                var authHeader = req.headers.authorization.split(' ');
                var token = authHeader[1];
                sequelize.models.AccessToken.getAccessToken(token, function (err, tokenObj) {
                    if (tokenObj) {
                        var userId = tokenObj.userId;
                        User.getUser(userId, function(err, user) {
                            if (user) {
                                callback(false, user);
                            } else {
                                callback("Failed getting username.");
                            }
                        });
                    }
                });
            },


            /**
             * Authenticates a user against the database
             * @memberof User
             * @param username {string}
             * @param password {string}
             * @param callback {function}
             */
            authenticate : function(username, password, callback) {
                var util = require('../utils.js');
                
                User.findOne({
                    where: { username: username, password: password }
                }).then(function(user) {
                    if(user == null) {
                        callback(false);
                    } else {
                        callback(false, user);
                    }
                }).catch(function(err) {
                    console.log(err);
                    callback(err);
                });
            },
            associate: function(models) {
                // User.belongsToMany(models.Role, {as: 'roles',through: 'user_roles'});
                //User.belongsTo(models.Role, {as: 'role', foreignKey: 'role_id'});
            },
            getKeysForLogIdentification: function (callback) {
                var keysToLog = {};
                keysToLog.modelKeysToLog = ["username"];
                callback(false, keysToLog);
            }
        },
        instanceMethods: {
            /**
             * Get the permissions for a user based on their user object
             * @memberof User
             * @param user {object}
             * @param callback {function}
             */
            // getPermissions : function(callback) {
            //     this.getRoles()
            //         .then(function(roles) {
            //             var permissionsArr = [];
            //             var promiseArr = [];
            //             roles.forEach(function(role) {
            //                 var deferred = $q.defer();
            //                 promiseArr.push(deferred.promise);
            //
            //                 role.getPermissions().then(function(permissions) {
            //                     permissions.forEach(function(permission) {
            //                         permissionsArr.push(permission);
            //                     });
            //                     deferred.resolve();
            //
            //                 }).catch(function(err) {
            //                     console.log(err);
            //                     callback(err);
            //                 });
            //             });
            //             $q.all(promiseArr).then(function() {
            //                 callback(false,permissionsArr);
            //             }).catch(function(err) {
            //                 console.log(err);
            //                 callback(err);
            //             });
            //         }).catch(function(err) {
            //             console.log(err);
            //             callback(err);
            //         });
            // },

            /**
             * Get the permission names as an array of strings for a user based on their user object
             * @memberof User
             * @param user {object}
             * @param callback {function}
             */
            // getPermissionNames : function(callback) {
            //     this.getRoles()
            //         .then(function(roles) {
            //             var permissionsArr = [];
            //             var promiseArr = [];
            //             roles.forEach(function(role) {
            //                 var deferred = $q.defer();
            //                 promiseArr.push(deferred.promise);
            //
            //                 role.getPermissions({attributes: ['name']}).then(function(permissions) {
            //                     permissions.forEach(function(permission) {
            //                         permissionsArr.push(permission.name);
            //                     });
            //                     deferred.resolve();
            //
            //                 });
            //             });
            //             $q.all(promiseArr).then(function() {
            //                 callback(false,JSON.stringify(permissionsArr));
            //             }).catch(function(err) {
            //                 console.log(err);
            //                 callback(err);
            //             });
            //         }).catch(function(err) {
            //             console.log(err);
            //             callback(err);
            //         });
            // },

            /**
             * Get the permission names as an array of strings for a user based on their user object
             * @memberof User
             * @param user {object}
             * @param callback {function}
             */
            // getRolePermissionsObjects : function(callback) {
            //     this.getRoles()
            //         .then(function(roles) {
            //             var permissionsArr = [];
            //             var promiseArr = [];
            //             roles.forEach(function(role) {
            //                 var deferred = $q.defer();
            //                 promiseArr.push(deferred.promise);
            //
            //                 role.getPermissions().then(function(permissions) {
            //                     permissions.forEach(function(permission) {
            //                         var rolePermission = {
            //                             role: role,
            //                             user_roles: role.user_roles,
            //                             permission: permission,
            //                             role_permissions: permission.role_permissions
            //                         };
            //                         permissionsArr.push(rolePermission);
            //                     });
            //                     deferred.resolve();
            //
            //                 }).catch(function(err) {
            //                     console.log(err);
            //                     callback(err);
            //                 });
            //             });
            //             $q.all(promiseArr).then(function() {
            //                 callback(false,permissionsArr);
            //             }).catch(function(err) {
            //                 console.log(err);
            //                 callback(err);
            //             });
            //         }).catch(function(err) {
            //         console.log(err);
            //         callback(err);
            //     });
            // },
            hasPermission: function(permissionName, callback) {

            }
        }
    });


    return User;
};
