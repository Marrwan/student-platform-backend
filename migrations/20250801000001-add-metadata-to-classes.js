'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Classes', 'metadata', {
      type: Sequelize.JSONB,
      defaultValue: {}
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Classes', 'metadata');
  }
}; 