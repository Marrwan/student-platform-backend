const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Permission = sequelize.define('Permission', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        group: {
            type: DataTypes.STRING,
            defaultValue: 'Others'
        }
    }, {
        paranoid: true // Soft delete
    });

    Permission.associate = (models) => {
        Permission.belongsToMany(models.Role, {
            through: 'RolePermission',
            foreignKey: 'permissionId',
            as: 'roles'
        });
        Permission.belongsToMany(models.User, {
            through: 'UserPermission',
            foreignKey: 'permissionId',
            as: 'users'
        });
    };

    return Permission;
};
