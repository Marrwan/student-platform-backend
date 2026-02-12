'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Badges
        await queryInterface.createTable('Badges', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            icon: {
                type: Sequelize.STRING,
                allowNull: false
            },
            category: {
                type: Sequelize.ENUM('milestone', 'skill', 'attendance', 'recognition'),
                allowNull: false
            },
            criteria: {
                type: Sequelize.JSON,
                allowNull: true
            },
            rarity: {
                type: Sequelize.ENUM('common', 'rare', 'epic', 'legendary'),
                defaultValue: 'common'
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

        // UserBadges
        await queryInterface.createTable('UserBadges', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            badgeId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Badges', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            earnedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            progress: {
                type: Sequelize.JSON,
                defaultValue: {}
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

        // Recognitions
        await queryInterface.createTable('Recognitions', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            fromUserId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            toUserId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            category: {
                type: Sequelize.ENUM('helpful', 'innovative', 'teamwork', 'leadership'),
                defaultValue: 'helpful'
            },
            isPublic: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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

        // InternsOfTheMonth
        await queryInterface.createTable('InternsOfTheMonth', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            month: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            year: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            reason: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            nominatedBy: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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

        // Unique constraint for Intern of the Month (one per month)
        await queryInterface.addConstraint('InternsOfTheMonth', {
            fields: ['month', 'year'],
            type: 'unique',
            name: 'unique_month_year_winner'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('InternsOfTheMonth');
        await queryInterface.dropTable('Recognitions');
        await queryInterface.dropTable('UserBadges');
        await queryInterface.dropTable('Badges');
    }
};
