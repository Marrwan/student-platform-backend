'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClassLeaderboards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      classId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      totalScore: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      assignmentScore: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      attendanceScore: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      assignmentsCompleted: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      totalAssignments: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      attendanceCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      totalSessions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      rank: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      lastUpdated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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

    // Add indexes
    await queryInterface.addIndex('ClassLeaderboards', ['classId']);
    await queryInterface.addIndex('ClassLeaderboards', ['userId']);
    await queryInterface.addIndex('ClassLeaderboards', ['totalScore']);
    await queryInterface.addIndex('ClassLeaderboards', ['rank']);
    await queryInterface.addIndex('ClassLeaderboards', ['lastUpdated']);
    
    // Add unique constraint to prevent duplicate leaderboard entries for same user in same class
    await queryInterface.addIndex('ClassLeaderboards', ['classId', 'userId'], {
      unique: true,
      name: 'class_leaderboards_unique_user_class'
    });

    console.log('✅ Created ClassLeaderboards table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ClassLeaderboards');
    console.log('✅ Dropped ClassLeaderboards table');
  }
};
