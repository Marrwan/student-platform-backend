'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('KeyResults', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            objectiveId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Objectives',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT
            },
            targetValue: {
                type: Sequelize.STRING
            },
            selfScore: {
                type: Sequelize.DECIMAL(5, 2),
                defaultValue: 0
            },
            reviewerScore: {
                type: Sequelize.DECIMAL(5, 2),
                defaultValue: 0
            },
            employeeComments: {
                type: Sequelize.TEXT
            },
            reviewerComments: {
                type: Sequelize.TEXT
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
        await queryInterface.dropTable('KeyResults');
    }
};
