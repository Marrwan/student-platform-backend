'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add new columns to Assignments table
      await queryInterface.addColumn('Assignments', 'sampleOutputUrl', {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isUrl: true
        }
      });

      await queryInterface.addColumn('Assignments', 'sampleOutputCode', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          html: '',
          css: '',
          javascript: ''
        }
      });

      await queryInterface.addColumn('Assignments', 'submissionMode', {
        type: Sequelize.ENUM('code', 'link', 'both'),
        defaultValue: 'both',
        allowNull: false
      });

      await queryInterface.addColumn('Assignments', 'paymentRequired', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });

      await queryInterface.addColumn('Assignments', 'paymentAmount', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 500,
        allowNull: false
      });

      console.log('✅ Enhanced Assignments table with new columns');
    } catch (error) {
      console.log('⚠️ Some columns might already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Assignments', 'sampleOutputUrl');
      await queryInterface.removeColumn('Assignments', 'sampleOutputCode');
      await queryInterface.removeColumn('Assignments', 'submissionMode');
      await queryInterface.removeColumn('Assignments', 'paymentRequired');
      await queryInterface.removeColumn('Assignments', 'paymentAmount');
      console.log('✅ Removed enhanced columns from Assignments table');
    } catch (error) {
      console.log('⚠️ Some columns might not exist:', error.message);
    }
  }
};
