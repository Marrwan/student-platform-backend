'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing fields to Projects table
    await queryInterface.addColumn('Projects', 'challengeId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Challenges',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('Projects', 'startDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Projects', 'endDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Projects', 'autoUnlock', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    await queryInterface.addColumn('Projects', 'unlockTime', {
      type: Sequelize.TIME,
      defaultValue: '00:00:00'
    });

    await queryInterface.addColumn('Projects', 'unlockDelay', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('Projects', 'prerequisites', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: []
    });

    await queryInterface.addColumn('Projects', 'bonusPoints', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('Projects', 'penaltyPoints', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('Projects', 'latePenalty', {
      type: Sequelize.DECIMAL(5, 2),
      defaultValue: 10
    });

    await queryInterface.addColumn('Projects', 'allowLateSubmission', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    await queryInterface.addColumn('Projects', 'maxLateHours', {
      type: Sequelize.INTEGER,
      defaultValue: 24
    });

    await queryInterface.addColumn('Projects', 'submissionLimit', {
      type: Sequelize.INTEGER,
      defaultValue: 1
    });

    await queryInterface.addColumn('Projects', 'videoUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Projects', 'resources', {
      type: Sequelize.JSONB,
      defaultValue: []
    });

    await queryInterface.addColumn('Projects', 'learningObjectives', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: []
    });

    await queryInterface.addColumn('Projects', 'skillsPracticed', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: []
    });

    await queryInterface.addColumn('Projects', 'hasLivePreview', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    await queryInterface.addColumn('Projects', 'hasCodeEditor', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    await queryInterface.addColumn('Projects', 'hasAutoTest', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('Projects', 'testCases', {
      type: Sequelize.JSONB,
      defaultValue: []
    });

    await queryInterface.addColumn('Projects', 'totalSubmissions', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('Projects', 'averageScore', {
      type: Sequelize.DECIMAL(5, 2),
      defaultValue: 0
    });

    await queryInterface.addColumn('Projects', 'completionRate', {
      type: Sequelize.DECIMAL(5, 2),
      defaultValue: 0
    });

    await queryInterface.addColumn('Projects', 'averageTimeSpent', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('Projects', 'settings', {
      type: Sequelize.JSONB,
      defaultValue: {}
    });

    await queryInterface.addColumn('Projects', 'metadata', {
      type: Sequelize.JSONB,
      defaultValue: {}
    });

    // Add indexes for new fields
    await queryInterface.addIndex('Projects', ['challengeId']);
    await queryInterface.addIndex('Projects', ['startDate']);
    await queryInterface.addIndex('Projects', ['endDate']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove added columns
    await queryInterface.removeColumn('Projects', 'challengeId');
    await queryInterface.removeColumn('Projects', 'startDate');
    await queryInterface.removeColumn('Projects', 'endDate');
    await queryInterface.removeColumn('Projects', 'autoUnlock');
    await queryInterface.removeColumn('Projects', 'unlockTime');
    await queryInterface.removeColumn('Projects', 'unlockDelay');
    await queryInterface.removeColumn('Projects', 'prerequisites');
    await queryInterface.removeColumn('Projects', 'bonusPoints');
    await queryInterface.removeColumn('Projects', 'penaltyPoints');
    await queryInterface.removeColumn('Projects', 'latePenalty');
    await queryInterface.removeColumn('Projects', 'allowLateSubmission');
    await queryInterface.removeColumn('Projects', 'maxLateHours');
    await queryInterface.removeColumn('Projects', 'submissionLimit');
    await queryInterface.removeColumn('Projects', 'videoUrl');
    await queryInterface.removeColumn('Projects', 'resources');
    await queryInterface.removeColumn('Projects', 'learningObjectives');
    await queryInterface.removeColumn('Projects', 'skillsPracticed');
    await queryInterface.removeColumn('Projects', 'hasLivePreview');
    await queryInterface.removeColumn('Projects', 'hasCodeEditor');
    await queryInterface.removeColumn('Projects', 'hasAutoTest');
    await queryInterface.removeColumn('Projects', 'testCases');
    await queryInterface.removeColumn('Projects', 'totalSubmissions');
    await queryInterface.removeColumn('Projects', 'averageScore');
    await queryInterface.removeColumn('Projects', 'completionRate');
    await queryInterface.removeColumn('Projects', 'averageTimeSpent');
    await queryInterface.removeColumn('Projects', 'settings');
    await queryInterface.removeColumn('Projects', 'metadata');
  }
}; 