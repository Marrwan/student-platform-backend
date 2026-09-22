'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to Users table
    await queryInterface.addColumn('Users', 'emailVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('Users', 'emailVerificationToken', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('Users', 'emailVerificationExpires', {
      type: Sequelize.DATE
    });

    await queryInterface.addColumn('Users', 'avatar', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('Users', 'bio', {
      type: Sequelize.TEXT
    });

    await queryInterface.addColumn('Users', 'githubUsername', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('Users', 'linkedinUrl', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('Users', 'emailNotifications', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    await queryInterface.addColumn('Users', 'pushNotifications', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    await queryInterface.addColumn('Users', 'permissions', {
      type: Sequelize.JSONB,
      defaultValue: {
        canCreateClasses: false,
        canManageStudents: false,
        canReviewSubmissions: false,
        canManageProjects: false,
        canViewAnalytics: false
      }
    });

    await queryInterface.addColumn('Users', 'metadata', {
      type: Sequelize.JSONB,
      defaultValue: {}
    });

    // Update role enum to include partial_admin
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('student', 'admin', 'partial_admin'),
      defaultValue: 'student'
    });

    // Update isActive default to false for email verification
    await queryInterface.changeColumn('Users', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove added columns
    await queryInterface.removeColumn('Users', 'emailVerified');
    await queryInterface.removeColumn('Users', 'emailVerificationToken');
    await queryInterface.removeColumn('Users', 'emailVerificationExpires');
    await queryInterface.removeColumn('Users', 'avatar');
    await queryInterface.removeColumn('Users', 'bio');
    await queryInterface.removeColumn('Users', 'githubUsername');
    await queryInterface.removeColumn('Users', 'linkedinUrl');
    await queryInterface.removeColumn('Users', 'emailNotifications');
    await queryInterface.removeColumn('Users', 'pushNotifications');
    await queryInterface.removeColumn('Users', 'permissions');
    await queryInterface.removeColumn('Users', 'metadata');

    // Revert role enum
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('student', 'admin'),
      defaultValue: 'student'
    });

    // Revert isActive default
    await queryInterface.changeColumn('Users', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  }
}; 