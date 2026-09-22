'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Get the admin user ID
      const adminUser = await queryInterface.sequelize.query(
        `SELECT id FROM "Users" WHERE email = 'devabdulbasid@gmail.com' LIMIT 1`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (adminUser.length === 0) {
        console.log('⚠️ Admin user not found, skipping class creation');
        return;
      }

      const adminId = adminUser[0].id;

      const sampleClasses = [
        {
          id: uuidv4(),
          name: 'JavaScript Fundamentals',
          description: 'Learn the basics of JavaScript programming including variables, functions, loops, and DOM manipulation. Perfect for beginners who want to start their web development journey.',
          level: 'beginner',
          maxStudents: 25,
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-31'),
          enrollmentCode: 'JS101',
          isActive: true,
          instructorId: adminId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          name: 'Advanced React Development',
          description: 'Master React.js with hooks, context, state management, and advanced patterns. Build complex applications and learn best practices for scalable React development.',
          level: 'advanced',
          maxStudents: 20,
          startDate: new Date('2024-09-15'),
          endDate: new Date('2025-01-15'),
          enrollmentCode: 'REACT202',
          isActive: true,
          instructorId: adminId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          name: 'Web Development Bootcamp',
          description: 'Comprehensive full-stack web development course covering HTML, CSS, JavaScript, Node.js, and databases. Build complete web applications from scratch.',
          level: 'intermediate',
          maxStudents: 30,
          startDate: new Date('2024-10-01'),
          endDate: new Date('2025-03-31'),
          enrollmentCode: 'WEBDEV300',
          isActive: true,
          instructorId: adminId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      for (const classData of sampleClasses) {
        try {
          await queryInterface.bulkInsert('Classes', [classData]);
          console.log(`✅ Created class: ${classData.name} (${classData.enrollmentCode})`);
        } catch (error) {
          console.log(`⚠️ Error creating class ${classData.name}:`, error.message);
        }
      }

      console.log('🎉 Sample classes created successfully!');
    } catch (error) {
      console.error('❌ Error creating sample classes:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('Classes', {
        enrollmentCode: {
          [Sequelize.Op.in]: ['JS101', 'REACT202', 'WEBDEV300']
        }
      });
      console.log('✅ Sample classes removed successfully');
    } catch (error) {
      console.error('❌ Error removing sample classes:', error);
      throw error;
    }
  }
};
