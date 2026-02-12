'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();

    // 1. Get existing Users (admin)
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "Users";`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Create Department
    const deptId = uuidv4();
    await queryInterface.bulkInsert('Departments', [{
       id: deptId,
       name: 'Innovation & Technology',
       description: 'Core Engineering and Product',
       location: 'HQ',
       isActive: true,
       createdAt: now,
       updatedAt: now
    }]);

    // Create Team
    const teamId = uuidv4();
    await queryInterface.bulkInsert('Teams', [{
        id: teamId,
        name: 'Engineering Lab',
        departmentId: deptId,
        leadId: users[0] ? users[0].id : null, 
        description: 'Backend & Frontend Engineering',
        isActive: true,
        createdAt: now,
        updatedAt: now
    }]);

    // Update Users to be in this Team
    if (users.length > 0) {
        await queryInterface.bulkUpdate('Users', 
            { 
                teamId: teamId, 
                departmentId: deptId,
                staffRole: 'Staff',
                jobTitle: 'Software Engineer',
                location: 'Abuja'
            },
            { id: users.map(u => u.id) }
        );
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Teams', null, {});
    await queryInterface.bulkDelete('Departments', null, {});
  }
};
