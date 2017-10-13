/**
 * User: mikeroth
 * Date: 4/14/15
 * Time: 4:51 PM
 */

module.exports = function (sequelize, DataTypes) {
    /**
     * AccessToken
     * @class AccessToken
     * @property {integer} id
     * @property {string} token
     * @property {integer} userId
     */
    var AccessToken = sequelize.define('AccessToken', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: DataTypes.STRING(1024),
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: "accesstokens",
        classMethods: {
            /**
             * Gets the access token if it exists
             * @memberof AccessToken
             * @param bearerToken {string}
             * @param callback {function}
             */
            getAccessToken: function (bearerToken, callback) {
                AccessToken.findOne({
                    where: {token: bearerToken}
                }).then(function (accessTokenObj) {
                    //console.log('in model');
                    //console.log(accessTokenObj.clientId);
                    if (accessTokenObj == null) {
                        callback('An active access token does not exist in the database.');
                    } else {
                        callback(false, accessTokenObj);
                    }
                }).catch(function (err) {
                    console.log(err);
                    callback(err);
                });
            },
            /**
             * Saves a new access token in the database
             * @memberof AccessToken
             * @param accessToken {text}
             * @param userId {integer}
             * @param callback {function}
             */
            saveAccessToken: function (accessToken, userId, callback) {
                AccessToken
                    .findOrCreate({
                        where: {
                            userId: userId
                        },
                        defaults: {
                            token: accessToken
                        }
                    })
                    .spread(function (token, created) {
                        console.log("Found access token: " + JSON.stringify(token));
                        if (!token) callback(false, null);
                        if (created || token.token !== accessToken) {
                            token.setDataValue('token', accessToken);
                            token.save().then(function () {
                                callback(false, token);
                            });
                        } else {
                            callback(false, token);
                        }
                    });
            },
            /**
             * Deletes access token from the database
             * @memberof AccessToken
             * @param accessToken {text}
             * @param userId {integer}
             * @param callback {function}
             */
            deleteAccessToken: function (accessToken, callback) {
                AccessToken.findOne({
                    where: {token: accessToken}
                }).then(function (accessTokenObj) {
                    accessTokenObj.destroy().then(function (destroyedToken) {
                        callback(false, destroyedToken);
                    })
                }).catch(function (err) {
                    console.log(err);
                    callback(err);
                });
            },
            associate: function (models) {

            }
        }
    });

    return AccessToken;
};
