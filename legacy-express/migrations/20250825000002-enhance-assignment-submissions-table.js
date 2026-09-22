'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add new columns to AssignmentSubmissions table
      await queryInterface.addColumn('AssignmentSubmissions', 'submissionLink', {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isUrl: true
        }
      });

      await queryInterface.addColumn('AssignmentSubmissions', 'paymentStatus', {
        type: Sequelize.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending',
        allowNull: false
      });

      await queryInterface.addColumn('AssignmentSubmissions', 'paymentAmount', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      });

      await queryInterface.addColumn('AssignmentSubmissions', 'paymentReference', {
        type: Sequelize.STRING,
        allowNull: true
      });

      await queryInterface.addColumn('AssignmentSubmissions', 'isBlocked', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });

      await queryInterface.addColumn('AssignmentSubmissions', 'blockReason', {
        type: Sequelize.TEXT,
        allowNull: true
      });

      console.log('✅ Enhanced AssignmentSubmissions table with new columns');
    } catch (error) {
      console.log('⚠️ Some columns might already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('AssignmentSubmissions', 'submissionLink');
      await queryInterface.removeColumn('AssignmentSubmissions', 'paymentStatus');
      await queryInterface.removeColumn('AssignmentSubmissions', 'paymentAmount');
      await queryInterface.removeColumn('AssignmentSubmissions', 'paymentReference');
      await queryInterface.removeColumn('AssignmentSubmissions', 'isBlocked');
      await queryInterface.removeColumn('AssignmentSubmissions', 'blockReason');
      console.log('✅ Removed enhanced columns from AssignmentSubmissions table');
    } catch (error) {
      console.log('⚠️ Some columns might not exist:', error.message);
    }
  }
};
