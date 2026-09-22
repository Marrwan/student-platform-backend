const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RolePermission = sequelize.define('RolePermission', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        roleId: {
            type: DataTypes.UUID,
            references: {
                model: 'Roles',
                key: 'id'
            }
        },
        permissionId: {
            type: DataTypes.UUID,
            references: {
                model: 'Permissions',
                key: 'id'
            }
        }
    }, {
        tableName: 'RolePermission',
        timestamps: true,
        indexes: [
            {
                fields: ['roleId']
            },
            {
                fields: ['permissionId']
            }
        ]
    });

    return RolePermission;
};
