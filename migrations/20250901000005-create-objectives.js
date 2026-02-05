'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Objectives', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            appraisalId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Appraisals',
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
            weight: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            score: {
                type: Sequelize.DECIMAL(5, 2),
                defaultValue: 0
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
        await queryInterface.dropTable('Objectives');
    }
};
