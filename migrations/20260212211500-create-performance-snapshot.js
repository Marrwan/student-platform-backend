'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PerformanceSnapshots', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
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
            weekNumber: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            year: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            attendanceScore: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            projectCompletionRate: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            challengeScore: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            appraisalScore: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            peerFeedbackScore: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            overallScore: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Add unique constraint for userId, weekNumber, year
        await queryInterface.addConstraint('PerformanceSnapshots', {
            fields: ['userId', 'weekNumber', 'year'],
            type: 'unique',
            name: 'unique_user_week_snapshot'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('PerformanceSnapshots');
    }
};
