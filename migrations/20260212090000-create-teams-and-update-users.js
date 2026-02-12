'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Create Teams table
        await queryInterface.createTable('Teams', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: Sequelize.TEXT
            },
            departmentId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Departments',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            leadId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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

        // 2. Add columns to Users table
        await queryInterface.addColumn('Users', 'teamId', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Teams',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('Users', 'onLeave', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });

        await queryInterface.addColumn('Users', 'isOnSuspension', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });

        // 3. Add indexes
        await queryInterface.addIndex('Teams', ['departmentId']);
        await queryInterface.addIndex('Teams', ['leadId']);
        await queryInterface.addIndex('Users', ['teamId']);
    },

    down: async (queryInterface, Sequelize) => {
        // Remove columns from Users
        await queryInterface.removeColumn('Users', 'isOnSuspension');
        await queryInterface.removeColumn('Users', 'onLeave');
        await queryInterface.removeColumn('Users', 'teamId');

        // Drop Teams table
        await queryInterface.dropTable('Teams');
    }
};
