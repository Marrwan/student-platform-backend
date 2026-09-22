'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Users', 'departmentId', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Departments',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('Users', 'managerId', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('Users', 'jobTitle', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('Users', 'staffRole', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('Users', 'location', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('Users', 'joinedAt', {
            type: Sequelize.DATE,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Users', 'departmentId');
        await queryInterface.removeColumn('Users', 'managerId');
        await queryInterface.removeColumn('Users', 'jobTitle');
        await queryInterface.removeColumn('Users', 'staffRole');
        await queryInterface.removeColumn('Users', 'location');
        await queryInterface.removeColumn('Users', 'joinedAt');
    }
};
