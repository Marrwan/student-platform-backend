module.exports = (sequelize, DataTypes) => {
    const UserBadge = sequelize.define('UserBadge', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        badgeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Badges',
                key: 'id'
            }
        },
        earnedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        progress: {
            type: DataTypes.JSON, // For tracking partial progress if needed
            defaultValue: {}
        }
    }, {
        tableName: 'UserBadges',
        timestamps: true
    });

    UserBadge.associate = (models) => {
        UserBadge.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        UserBadge.belongsTo(models.Badge, { foreignKey: 'badgeId', as: 'badge' });
    };

    return UserBadge;
};
