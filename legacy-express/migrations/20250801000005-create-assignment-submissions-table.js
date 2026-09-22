'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AssignmentSubmissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      assignmentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Assignments',
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
      enrollmentId: {
        type: Sequelize.UUID,
        references: {
          model: 'ClassEnrollments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      submissionType: {
        type: Sequelize.ENUM('github', 'code', 'zip'),
        allowNull: false
      },
      githubUrl: {
        type: Sequelize.STRING
      },
      codeContent: {
        type: Sequelize.JSONB,
        defaultValue: {
          html: '',
          css: '',
          javascript: ''
        }
      },
      zipFileUrl: {
        type: Sequelize.STRING
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('pending', 'reviewed', 'accepted', 'rejected'),
        defaultValue: 'pending'
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        validate: {
          min: 0,
          max: 100
        }
      },
      feedback: {
        type: Sequelize.TEXT
      },
      reviewedBy: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      reviewedAt: {
        type: Sequelize.DATE
      },
      latePenalty: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      finalScore: {
        type: Sequelize.DECIMAL(5, 2)
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
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
    await queryInterface.addIndex('AssignmentSubmissions', ['assignmentId']);
    await queryInterface.addIndex('AssignmentSubmissions', ['userId']);
    await queryInterface.addIndex('AssignmentSubmissions', ['enrollmentId']);
    await queryInterface.addIndex('AssignmentSubmissions', ['status']);
    await queryInterface.addIndex('AssignmentSubmissions', ['submittedAt']);
    await queryInterface.addIndex('AssignmentSubmissions', ['reviewedBy']);
    
    // Add unique constraint to prevent multiple submissions per user per assignment
    await queryInterface.addIndex('AssignmentSubmissions', ['assignmentId', 'userId'], {
      unique: true,
      name: 'assignment_submissions_unique_user_assignment'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AssignmentSubmissions');
  }
}; 