'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Enable the uuid-ossp extension to provide uuid_generate_v4() function
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  },

  down: async (queryInterface, Sequelize) => {
    // Disable the uuid-ossp extension
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS "uuid-ossp";');
  }
}; 