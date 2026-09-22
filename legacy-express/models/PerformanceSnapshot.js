module.exports = (sequelize, DataTypes) => {
    const PerformanceSnapshot = sequelize.define('PerformanceSnapshot', {
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
        weekNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        attendanceScore: {
            type: DataTypes.FLOAT, // 0-100
            defaultValue: 0
        },
        projectCompletionRate: {
            type: DataTypes.FLOAT, // 0-100
            defaultValue: 0
        },
        challengeScore: {
            type: DataTypes.FLOAT, // Normalized score from challenges
            defaultValue: 0
        },
        appraisalScore: {
            type: DataTypes.FLOAT, // 0-5 or 0-10 normalized to 100
            defaultValue: 0
        },
        peerFeedbackScore: {
            type: DataTypes.FLOAT, // 0-5 normalized to 100
            defaultValue: 0
        },
        overallScore: {
            type: DataTypes.FLOAT, // Weighted average
            defaultValue: 0
        }
    }, {
        tableName: 'PerformanceSnapshots',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['userId', 'weekNumber', 'year']
            }
        ]
    });

    PerformanceSnapshot.associate = (models) => {
        PerformanceSnapshot.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return PerformanceSnapshot;
};
