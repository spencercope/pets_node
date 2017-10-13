module.exports = function(sequelize, DataTypes) {
    var $q = require('q');
    /**
     *  LoginStats
     *  @class LoginStats
     *  @property {integer} id
     *  @property {string} tilename
     *  @property {string} password
     *  @property {string} name
     */
    var LoginStats = sequelize.define('LoginStats', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING
        },
        ip: {
            type: DataTypes.STRING
        },
        createdAt: {
            type: DataTypes.DATE
        },
        updatedAt: {
            type: DataTypes.DATE
        }
    }, {
        tableName: "loginStats",
        timestamps: true,
        setterMethods: {
        },
        classMethods: {
            getAll : function(callback){
                LoginStats.findAll({
                    // where: {
                    //     userId: id
                    // }
                }).then(function (loginStats) {
                    callback(false,  loginStats);
                }).catch(function (err) {
                    console.log(err);
                    callback(err);
                });
            },
            createEntity : function(ip, username, callback){
                LoginStats.create({
                    username: username,
                    ip: ip
                }).then(function (loginStat) {
                    callback(false,  loginStat);
                }).catch(function (err) {
                    console.log(err);
                    callback(err);
                });
            },
            associate: function(models) {
                // LoginStats.belongsToMany(models.Role, {as: 'roles',through: 'tile_roles'});
                //LoginStats.belongsTo(models.Role, {as: 'role', foreignKey: 'role_id'});
            }
        },
        instanceMethods: {

        }
    });

    return LoginStats;
};
