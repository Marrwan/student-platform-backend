const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const StandupResponse = sequelize.define('StandupResponse', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        standupId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Standups',
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        whatDidYouDo: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        whatWillYouDo: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        blockers: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        attendanceStatus: {
            type: DataTypes.ENUM('present', 'absent', 'late'),
            defaultValue: 'present'
        },
        submittedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'StandupResponses',
        timestamps: true
    });

    StandupResponse.associate = (models) => {
        StandupResponse.belongsTo(models.Standup, {
            foreignKey: 'standupId',
            as: 'standup'
        });
        StandupResponse.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };

    return StandupResponse;
};
