'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('ClassEnrollments', 'attendanceScore', {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
        allowNull: false,
        validate: {
          min: 0,
          max: 100
        }
      });
      console.log('✅ Added attendanceScore column to ClassEnrollments table');
    } catch (error) {
      console.log('⚠️ Column attendanceScore might already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('ClassEnrollments', 'attendanceScore');
      console.log('✅ Removed attendanceScore column from ClassEnrollments table');
    } catch (error) {
      console.log('⚠️ Column attendanceScore might not exist:', error.message);
    }
  }
};
