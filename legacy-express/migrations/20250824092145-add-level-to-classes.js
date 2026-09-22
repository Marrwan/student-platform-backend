'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Classes', 'level', {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'beginner',
        allowNull: false
      });
      console.log('✅ Added level column to Classes table');
    } catch (error) {
      console.log('⚠️ Column level might already exist:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Classes', 'level');
      console.log('✅ Removed level column from Classes table');
    } catch (error) {
      console.log('⚠️ Column level might not exist:', error.message);
    }
  }
};
