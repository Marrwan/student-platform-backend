'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Appraisals', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            cycleId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'AppraisalCycles',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            reviewerId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            counterSignerId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            status: {
                type: Sequelize.ENUM(
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
                type: Sequelize.DECIMAL(5, 2),
                defaultValue: 0
            },
            employeeComments: {
                type: Sequelize.TEXT
            },
            reviewerComments: {
                type: Sequelize.TEXT
            },
            counterSignerComments: {
                type: Sequelize.TEXT
            },
            completedAt: {
                type: Sequelize.DATE
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Appraisals');
    }
};
