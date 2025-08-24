'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const testStudent = {
        id: uuidv4(),
        email: 'teststudent@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Student',
        role: 'student',
        isActive: true,
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        lastLogin: new Date(),
        resetPasswordToken: null,
        resetPasswordExpires: null,
        totalScore: 0,
        streakCount: 0,
        completedProjects: 0,
        missedDeadlines: 0,
        avatar: null,
        bio: 'Test student for invitation system',
        githubUsername: null,
        linkedinUrl: null,
        emailNotifications: true,
        pushNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Check if user already exists
      const existingUser = await queryInterface.sequelize.query(
        `SELECT id FROM "Users" WHERE email = 'teststudent@example.com' LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (existingUser.length > 0) {
        console.log('⚠️ Test student already exists, skipping creation');
        return;
      }

      await queryInterface.bulkInsert('Users', [testStudent]);
      console.log('✅ Test student created successfully');
      console.log('📧 Email: teststudent@example.com');
      console.log('🔑 Password: password123');
      console.log('👤 Role: student');
    } catch (error) {
      console.error('❌ Error creating test student:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('Users', {
        email: 'teststudent@example.com'
      });
      console.log('✅ Test student removed successfully');
    } catch (error) {
      console.error('❌ Error removing test student:', error);
      throw error;
    }
  }
};
