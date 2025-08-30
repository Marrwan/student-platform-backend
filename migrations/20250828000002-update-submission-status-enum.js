'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // First, update any existing 'rejected' statuses to 'reviewed'
      await queryInterface.sequelize.query(
        `UPDATE "AssignmentSubmissions" SET status = 'reviewed' WHERE status = 'rejected'`,
        { transaction }
      );

      // Remove the default constraint first
      await queryInterface.sequelize.query(
        `ALTER TABLE "AssignmentSubmissions" ALTER COLUMN status DROP DEFAULT`,
        { transaction }
      );

      // Remove 'rejected' from the enum
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_AssignmentSubmissions_status" RENAME TO "enum_AssignmentSubmissions_status_old"`,
        { transaction }
      );

      // Create new enum without 'rejected'
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_AssignmentSubmissions_status" AS ENUM('pending', 'reviewed', 'accepted')`,
        { transaction }
      );

      // Update the column to use the new enum
      await queryInterface.sequelize.query(
        `ALTER TABLE "AssignmentSubmissions" ALTER COLUMN status TYPE "enum_AssignmentSubmissions_status" USING status::text::"enum_AssignmentSubmissions_status"`,
        { transaction }
      );

      // Add the default constraint back
      await queryInterface.sequelize.query(
        `ALTER TABLE "AssignmentSubmissions" ALTER COLUMN status SET DEFAULT 'pending'`,
        { transaction }
      );

      // Drop the old enum
      await queryInterface.sequelize.query(
        `DROP TYPE "enum_AssignmentSubmissions_status_old"`,
        { transaction }
      );

      // Add requestCorrection column
      await queryInterface.addColumn('AssignmentSubmissions', 'requestCorrection', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove requestCorrection column
      await queryInterface.removeColumn('AssignmentSubmissions', 'requestCorrection', { transaction });

      // Remove the default constraint first
      await queryInterface.sequelize.query(
        `ALTER TABLE "AssignmentSubmissions" ALTER COLUMN status DROP DEFAULT`,
        { transaction }
      );

      // Revert enum changes
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_AssignmentSubmissions_status" RENAME TO "enum_AssignmentSubmissions_status_new"`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_AssignmentSubmissions_status" AS ENUM('pending', 'reviewed', 'accepted', 'rejected')`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE "AssignmentSubmissions" ALTER COLUMN status TYPE "enum_AssignmentSubmissions_status" USING status::text::"enum_AssignmentSubmissions_status"`,
        { transaction }
      );

      // Add the default constraint back
      await queryInterface.sequelize.query(
        `ALTER TABLE "AssignmentSubmissions" ALTER COLUMN status SET DEFAULT 'pending'`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE "enum_AssignmentSubmissions_status_new"`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
