/**
 * Created by pzahniel on 6/22/16.
 */
module.exports = function(sequelize, DataTypes) {
    /**
     *  UserRoles
     *  @class UserRoles
     *  @property {integer} RoleId
     *  @property {integer} UserId
     */
    var UserRoles = sequelize.define('user_roles', {
        RoleId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        UserId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        entityType: {
            type: DataTypes.STRING,
            defaultValue: 'user_roles'
    }
    }, {
        tableName: "user_roles",
        classMethods: {
            associate: function(models) {
                // UserRoles.belongsTo(models.User, { as: 'user', foreignKey: 'UserId' });
                // UserRoles.belongsTo(models.Role, { as: 'role', foreignKey: 'RoleId' });
            },
            getAllAdminUsers : function(callback) {
                UserRoles.findAll({
                    where: {RoleId: 1},
                    include: [
                        {
                            model: sequelize.models.User,
                            as: 'user'
                        },
                        {
                            model: sequelize.models.Role,
                            as: 'role'
                        }
                    ]
                }).then(function (UserRoles) {
                    callback(false, UserRoles);
                }).catch(function (err) {
                    console.log(err);
                    callback(err, []);
                });
            }
        }
    });

    return UserRoles;
};
