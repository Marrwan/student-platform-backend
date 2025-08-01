'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PlagiarismReports', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      submissionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Submissions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      comparedSubmissionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Submissions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      similarity: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      flagged: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      details: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PlagiarismReports');
  },
}; 