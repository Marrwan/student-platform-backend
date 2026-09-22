module.exports = (sequelize, DataTypes) => {
    const Badge = sequelize.define('Badge', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        icon: {
            type: DataTypes.STRING, // URL or icon identifier
            allowNull: false
        },
        category: {
            type: DataTypes.ENUM('milestone', 'skill', 'attendance', 'recognition'),
            allowNull: false
        },
        criteria: {
            type: DataTypes.JSON, // Logic for awarding, e.g., { type: 'standup_streak', count: 5 }
            allowNull: true
        },
        rarity: {
            type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
            defaultValue: 'common'
        }
    }, {
        tableName: 'Badges',
        timestamps: true
    });

    Badge.associate = (models) => {
        Badge.hasMany(models.UserBadge, { foreignKey: 'badgeId', as: 'userBadges' });
    };

    return Badge;
};
