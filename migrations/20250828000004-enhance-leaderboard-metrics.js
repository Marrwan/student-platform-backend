'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ClassLeaderboards', 'timelySubmissionScore', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Score for timely submissions'
    });

    await queryInterface.addColumn('ClassLeaderboards', 'timelySubmissions', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of timely submissions'
    });

    await queryInterface.addColumn('ClassLeaderboards', 'totalSubmissions', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total number of submissions'
    });

    await queryInterface.addColumn('ClassLeaderboards', 'averageAssignmentScore', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Average score across all assignments'
    });

    await queryInterface.addColumn('ClassLeaderboards', 'averageAttendanceScore', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Average attendance score per session'
    });

    // Add comments to existing columns
    await queryInterface.changeColumn('ClassLeaderboards', 'assignmentScore', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Highest score from assignments'
    });

    await queryInterface.changeColumn('ClassLeaderboards', 'attendanceScore', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Total attendance score'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ClassLeaderboards', 'timelySubmissionScore');
    await queryInterface.removeColumn('ClassLeaderboards', 'timelySubmissions');
    await queryInterface.removeColumn('ClassLeaderboards', 'totalSubmissions');
    await queryInterface.removeColumn('ClassLeaderboards', 'averageAssignmentScore');
    await queryInterface.removeColumn('ClassLeaderboards', 'averageAttendanceScore');
    
    // Remove comments from existing columns
    await queryInterface.changeColumn('ClassLeaderboards', 'assignmentScore', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.changeColumn('ClassLeaderboards', 'attendanceScore', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    });
  }
};
