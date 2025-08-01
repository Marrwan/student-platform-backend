'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const classes = [
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming including variables, functions, and DOM manipulation.',
        instructorId: '550e8400-e29b-41d4-a716-446655440000', // Admin user
        enrollmentCode: 'JSFUND01',
        maxStudents: 30,
        isActive: true,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-12-31'),
        level: 'beginner',
        category: 'Programming',
        language: 'English',
        timezone: 'UTC',
        isPublic: true,
        allowEnrollment: true,
        autoEnroll: false,
        tags: ['javascript', 'beginner', 'fundamentals'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        name: 'React Development',
        description: 'Master React.js framework for building modern web applications with components and hooks.',
        instructorId: '550e8400-e29b-41d4-a716-446655440000', // Admin user
        enrollmentCode: 'REACT01',
        maxStudents: 25,
        isActive: true,
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-11-30'),
        level: 'intermediate',
        category: 'Web Development',
        language: 'English',
        timezone: 'UTC',
        isPublic: true,
        allowEnrollment: true,
        autoEnroll: false,
        tags: ['react', 'javascript', 'frontend'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        name: 'Node.js Backend Development',
        description: 'Build scalable backend applications using Node.js, Express, and MongoDB.',
        instructorId: '550e8400-e29b-41d4-a716-446655440000', // Admin user
        enrollmentCode: 'NODE01',
        maxStudents: 20,
        isActive: true,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-12-15'),
        level: 'advanced',
        category: 'Backend Development',
        language: 'English',
        timezone: 'UTC',
        isPublic: true,
        allowEnrollment: true,
        autoEnroll: false,
        tags: ['nodejs', 'express', 'mongodb', 'backend'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        name: 'CSS and Styling',
        description: 'Learn modern CSS techniques including Flexbox, Grid, and responsive design.',
        instructorId: '550e8400-e29b-41d4-a716-446655440000', // Admin user
        enrollmentCode: 'CSS01',
        maxStudents: 35,
        isActive: true,
        startDate: new Date('2025-08-10'),
        endDate: new Date('2025-10-31'),
        level: 'beginner',
        category: 'Web Design',
        language: 'English',
        timezone: 'UTC',
        isPublic: true,
        allowEnrollment: true,
        autoEnroll: false,
        tags: ['css', 'styling', 'design', 'responsive'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        name: 'Full Stack Development',
        description: 'Comprehensive course covering both frontend and backend development with modern technologies.',
        instructorId: '550e8400-e29b-41d4-a716-446655440000', // Admin user
        enrollmentCode: 'FULL01',
        maxStudents: 15,
        isActive: true,
        startDate: new Date('2025-09-15'),
        endDate: new Date('2026-01-31'),
        level: 'advanced',
        category: 'Full Stack',
        language: 'English',
        timezone: 'UTC',
        isPublic: true,
        allowEnrollment: true,
        autoEnroll: false,
        tags: ['fullstack', 'javascript', 'react', 'nodejs'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Classes', classes, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Classes', null, {});
  }
}; 