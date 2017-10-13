module.exports = function(sequelize, DataTypes) {
    var $q = require('q');
    var md5 = require('md5');
    /**
     *  Tile
     *  @class Tile
     *  @property {integer} id
     *  @property {string} tilename
     *  @property {string} password
     *  @property {string} name
     */
    var Tile = sequelize.define('Tile', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        routeName: {
            type: DataTypes.STRING
        },
        displayName: {
            type: DataTypes.STRING
        },
        mdIcon: {
            type: DataTypes.STRING
        },
        userId: {
            type: DataTypes.INTEGER
        },
        createdAt: {
            type: DataTypes.DATE
        },
        updatedAt: {
            type: DataTypes.DATE
        }
    }, {
        tableName: "tiles",
        timestamps: true,
        setterMethods: {
        },
        classMethods: {
            getAll : function(id, callback){
                Tile.findAll().then(function (tiles) {
                    callback(false, tiles);
                }).catch(function (err) {
                    console.log(err);
                    callback(err);
                });
            },
            createEntity : function(entity, callback){
                Tile.create({
                    routeName: entity.routeName,
                    displayName: entity.displayName,
                    mdIcon: entity.mdIcon,
                    userId: entity.userId
                }).then(function (tile) {
                    callback(false,  tile);
                }).catch(function (err) {
                    console.log(err);
                    callback(err);
                });
            },
            findAndUpdate : function(entity, callback) {
                Tile.update({
                    routeName: entity.routeName,
                    displayName: entity.displayName,
                    mdIcon: entity.mdIcon,
                    userId: entity.userId
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
            associate: function(models) {
                // Tile.belongsToMany(models.Role, {as: 'roles',through: 'tile_roles'});
                //Tile.belongsTo(models.Role, {as: 'role', foreignKey: 'role_id'});
            }
        },
        instanceMethods: {

        }
    });


    return Tile;
};
