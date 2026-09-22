'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClassEnrollments', {
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
        }
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      enrolledAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'dropped', 'completed'),
        defaultValue: 'active'
      },
      role: {
        type: Sequelize.ENUM('student', 'teaching_assistant'),
        defaultValue: 'student'
      },
      grade: {
        type: Sequelize.DECIMAL(5, 2),
        validate: { min: 0, max: 100 }
      },
      attendance: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastActivity: {
        type: Sequelize.DATE
      },
      progress: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
        validate: { min: 0, max: 100 }
      },
      completedAssignments: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      totalAssignments: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      averageScore: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      notes: {
        type: Sequelize.TEXT
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      invitedBy: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      invitedAt: {
        type: Sequelize.DATE
      },
      acceptedAt: {
        type: Sequelize.DATE
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

    // Add indexes
    await queryInterface.addIndex('ClassEnrollments', ['classId', 'userId'], {
      unique: true
    });
    await queryInterface.addIndex('ClassEnrollments', ['status']);
    await queryInterface.addIndex('ClassEnrollments', ['enrolledAt']);
    await queryInterface.addIndex('ClassEnrollments', ['lastActivity']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ClassEnrollments');
  }
}; 