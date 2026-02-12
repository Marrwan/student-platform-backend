const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Standup = sequelize.define('Standup', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        scheduledFor: {
            type: DataTypes.DATE,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        teamId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Teams',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'in_progress', 'completed'),
            defaultValue: 'scheduled'
        }
    }, {
        tableName: 'Standups',
        timestamps: true
    });

    Standup.associate = (models) => {
        Standup.belongsTo(models.User, {
            foreignKey: 'createdBy',
            as: 'creator'
        });
        Standup.belongsTo(models.Team, {
            foreignKey: 'teamId',
            as: 'team'
        });
        Standup.hasMany(models.StandupResponse, {
            foreignKey: 'standupId',
            as: 'responses'
        });
        Standup.hasMany(models.ActionItem, {
            foreignKey: 'standupId',
            as: 'actionItems'
        });
    };

    return Standup;
};
