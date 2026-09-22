'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Step 1: Add 'instructor' and 'staff' to the ENUM
        await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'instructor';
    `);
        await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Users_role" ADD VALUE IF NOT EXISTS 'staff';
    `);

        // Step 2: Update all existing partial_admin users to 'staff'
        await queryInterface.sequelize.query(`
      UPDATE "Users" SET "role" = 'staff' WHERE "role" = 'partial_admin';
    `);

        // Note: PostgreSQL does not support removing values from an ENUM easily.
        // The old 'partial_admin' value will remain in the ENUM but no rows use it.
        // This is safe and avoids a complex type recreation.
    },

    async down(queryInterface, Sequelize) {
        // Revert staff users back to partial_admin
        await queryInterface.sequelize.query(`
      UPDATE "Users" SET "role" = 'partial_admin' WHERE "role" = 'staff';
    `);
        // Note: Cannot remove ENUM values in PostgreSQL without recreating the type
    }
};
