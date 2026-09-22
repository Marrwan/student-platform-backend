const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Appraisal = sequelize.define('Appraisal', {
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
        cycleId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'AppraisalCycles',
                key: 'id'
            }
        },
        reviewerId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        counterSignerId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM(
                'goal_setting',
                'pending_employee_review',
                'pending_supervisor_review',
                'pending_countersigner_review',
                'completed',
                'rejected'
            ),
            defaultValue: 'goal_setting'
        },
        totalScore: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0
        },
        employeeComments: {
            type: DataTypes.TEXT
        },
        reviewerComments: {
            type: DataTypes.TEXT
        },
        counterSignerComments: {
            type: DataTypes.TEXT
        },
        completedAt: {
            type: DataTypes.DATE
        }
    });

    Appraisal.associate = (models) => {
        Appraisal.belongsTo(models.User, { foreignKey: 'userId', as: 'employee' });
        Appraisal.belongsTo(models.User, { foreignKey: 'reviewerId', as: 'reviewer' });
        Appraisal.belongsTo(models.User, { foreignKey: 'counterSignerId', as: 'counterSigner' });
        Appraisal.belongsTo(models.AppraisalCycle, { foreignKey: 'cycleId', as: 'cycle' });
        Appraisal.hasMany(models.Objective, { foreignKey: 'appraisalId', as: 'objectives' });
    };

    return Appraisal;
};
