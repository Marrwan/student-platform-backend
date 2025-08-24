'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to AssignmentSubmissions table
    const columns = [
      {
        name: 'githubLink',
        type: Sequelize.STRING(500),
        allowNull: true
      },
      {
        name: 'codeSubmission',
        type: Sequelize.JSONB,
        defaultValue: { html: '', css: '', javascript: '' }
      },
      {
        name: 'zipFileUrl',
        type: Sequelize.STRING(500),
        allowNull: true
      },
      {
        name: 'submittedAt',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      {
        name: 'status',
        type: Sequelize.STRING(20),
        defaultValue: 'pending'
      },
      {
        name: 'score',
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      {
        name: 'isLate',
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      {
        name: 'latePenalty',
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      {
        name: 'adminFeedback',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'adminComments',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'reviewedBy',
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      {
        name: 'reviewedAt',
        type: Sequelize.DATE,
        allowNull: true
      },
      {
        name: 'bonusPoints',
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      {
        name: 'deductions',
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      {
        name: 'finalScore',
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      {
        name: 'metadata',
        type: Sequelize.JSONB,
        defaultValue: {}
      }
    ];

    for (const column of columns) {
      try {
        await queryInterface.addColumn('AssignmentSubmissions', column.name, {
          type: column.type,
          allowNull: column.allowNull,
          defaultValue: column.defaultValue,
          references: column.references,
          onUpdate: column.onUpdate,
          onDelete: column.onDelete
        });
        console.log(`✅ Added column ${column.name} to AssignmentSubmissions table`);
      } catch (error) {
        console.log(`⚠️ Column ${column.name} might already exist:`, error.message);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the columns in reverse order
    const columns = [
      'metadata',
      'finalScore',
      'deductions',
      'bonusPoints',
      'reviewedAt',
      'reviewedBy',
      'adminComments',
      'adminFeedback',
      'latePenalty',
      'isLate',
      'score',
      'status',
      'submittedAt',
      'zipFileUrl',
      'codeSubmission',
      'githubLink'
    ];

    for (const columnName of columns) {
      try {
        await queryInterface.removeColumn('AssignmentSubmissions', columnName);
        console.log(`✅ Removed column ${columnName} from AssignmentSubmissions table`);
      } catch (error) {
        console.log(`⚠️ Column ${columnName} might not exist:`, error.message);
      }
    }
  }
};
