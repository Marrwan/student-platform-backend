'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'link' to the submissionType enum
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_AssignmentSubmissions_submissionType" ADD VALUE 'link';
      `);
      console.log('✅ Added "link" to submissionType enum');
    } catch (error) {
      console.log('⚠️ Error adding "link" to enum:', error.message);
      // If the enum already has 'link', that's fine
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values easily
    // This is a limitation - we can't easily rollback enum additions
    console.log('⚠️ Cannot easily remove enum value "link" from submissionType');
  }
};
