'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Submissions', {
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
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      githubLink: {
        type: Sequelize.STRING,
        allowNull: false
      },
      codeSubmission: {
        type: Sequelize.TEXT
      },
      zipFileUrl: {
        type: Sequelize.STRING
      },
      submittedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('pending', 'reviewed', 'accepted', 'rejected'),
        defaultValue: 'pending'
      },
      score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isLate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      latePenalty: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      adminFeedback: {
        type: Sequelize.TEXT
      },
      adminComments: {
        type: Sequelize.TEXT
      },
      reviewedBy: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      reviewedAt: {
        type: Sequelize.DATE
      },
      bonusPoints: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      deductions: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      finalScore: {
        type: Sequelize.INTEGER,
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

    // Add unique constraint for user-project combination
    await queryInterface.addIndex('Submissions', ['userId', 'projectId'], {
      unique: true,
      name: 'submissions_user_project_unique'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Submissions', ['status']);
    await queryInterface.addIndex('Submissions', ['submittedAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Submissions');
  }
}; 