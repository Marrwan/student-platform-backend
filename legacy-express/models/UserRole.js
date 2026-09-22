const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserRole = sequelize.define('UserRole', {
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
        roleId: {
            type: DataTypes.UUID,
            references: {
                model: 'Roles',
                key: 'id'
            }
        }
    }, {
        tableName: 'UserRole',
        timestamps: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['roleId']
            }
        ]
    });

    return UserRole;
};
