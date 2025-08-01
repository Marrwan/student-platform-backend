'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await queryInterface.bulkInsert('Users', [{
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@javascriptchallenge.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      totalScore: 0,
      streakCount: 0,
      completedProjects: 0,
      missedDeadlines: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', { email: 'admin@javascriptchallenge.com' }, {});
  }
}; 