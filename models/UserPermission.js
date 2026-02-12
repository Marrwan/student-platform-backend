const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserPermission = sequelize.define('UserPermission', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            references: {
                model: 'Users',
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
        tableName: 'UserPermission',
        timestamps: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['permissionId']
            }
        ]
    });

    return UserPermission;
};
