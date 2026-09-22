'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Create Portfolios table
        await queryInterface.createTable('Portfolios', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            bio: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            skills: {
                type: Sequelize.JSON,
                defaultValue: []
            },
            socialLinks: {
                type: Sequelize.JSON,
                defaultValue: {}
            },
            isPublic: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
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

        // Create PortfolioProjects table
        await queryInterface.createTable('PortfolioProjects', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            portfolioId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Portfolios',
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
                type: Sequelize.TEXT,
                allowNull: false
            },
            projectUrl: {
                type: Sequelize.STRING,
                allowNull: true
            },
            repoUrl: {
                type: Sequelize.STRING,
                allowNull: true
            },
            technologies: {
                type: Sequelize.JSON,
                defaultValue: []
            },
            imageUrl: {
                type: Sequelize.STRING,
                allowNull: true
            },
            featured: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('PortfolioProjects');
        await queryInterface.dropTable('Portfolios');
    }
};
