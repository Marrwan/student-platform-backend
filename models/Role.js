const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Role = sequelize.define('Role', {
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
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        paranoid: true // Soft delete
    });

    Role.associate = (models) => {
        Role.belongsToMany(models.Permission, {
            through: 'RolePermission',
            foreignKey: 'roleId',
            as: 'permissions'
        });
        Role.belongsToMany(models.User, {
            through: 'UserRole',
            foreignKey: 'roleId',
            as: 'users'
        });
    };

    return Role;
};
