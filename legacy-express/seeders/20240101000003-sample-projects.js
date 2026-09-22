'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const projects = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Hello World',
        description: 'Create your first HTML page with a simple "Hello World" message.',
        day: 1,
        difficulty: 'easy',
        maxScore: 100,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        requirements: JSON.stringify([
          'Create an HTML file named index.html',
          'Include a proper HTML5 structure',
          'Add a heading with "Hello World"',
          'Include a paragraph with your name',
          'Add basic styling with CSS'
        ]),
        sampleOutput: 'A simple HTML page displaying "Hello World" with your name',
        isUnlocked: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Personal Portfolio',
        description: 'Build a personal portfolio website showcasing your skills and projects.',
        day: 2,
        difficulty: 'easy',
        maxScore: 150,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        requirements: JSON.stringify([
          'Create a responsive portfolio website',
          'Include sections for About, Skills, Projects, and Contact',
          'Use CSS Grid or Flexbox for layout',
          'Add hover effects and animations',
          'Make it mobile-friendly',
          'Include at least 3 project showcases'
        ]),
        sampleOutput: 'A professional-looking portfolio website',
        isUnlocked: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        title: 'Calculator App',
        description: 'Build a functional calculator using HTML, CSS, and JavaScript.',
        day: 3,
        difficulty: 'medium',
        maxScore: 200,
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        requirements: JSON.stringify([
          'Create a calculator with basic operations (+, -, *, /)',
          'Include a display screen for results',
          'Add number buttons (0-9) and operation buttons',
          'Implement clear and equals functionality',
          'Handle decimal numbers',
          'Add keyboard support',
          'Include error handling for division by zero'
        ]),
        sampleOutput: 'A fully functional calculator with a clean interface',
        isUnlocked: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        title: 'Todo List Manager',
        description: 'Create a todo list application with add, edit, delete, and mark complete functionality.',
        day: 4,
        difficulty: 'medium',
        maxScore: 250,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        requirements: JSON.stringify([
          'Create a todo list with add new task functionality',
          'Allow editing existing tasks',
          'Implement delete task functionality',
          'Add ability to mark tasks as complete/incomplete',
          'Include local storage to persist data',
          'Add task filtering (All, Active, Completed)',
          'Include task counter showing total and completed tasks',
          'Add due date functionality for tasks'
        ]),
        sampleOutput: 'A comprehensive todo list application with all CRUD operations',
        isUnlocked: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        title: 'Weather Dashboard',
        description: 'Build a weather dashboard that fetches and displays weather data from an API.',
        day: 5,
        difficulty: 'medium',
        maxScore: 300,
        deadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
        requirements: JSON.stringify([
          'Integrate with a weather API (OpenWeatherMap, WeatherAPI, etc.)',
          'Display current weather conditions',
          'Show 5-day weather forecast',
          'Include temperature, humidity, wind speed, and weather description',
          'Add location search functionality',
          'Display weather icons based on conditions',
          'Include responsive design for mobile devices',
          'Add loading states and error handling'
        ]),
        sampleOutput: 'A weather dashboard with current and forecast data',
        isUnlocked: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        title: 'E-commerce Product Page',
        description: 'Create a product page for an e-commerce website with product details, images, and cart functionality.',
        day: 6,
        difficulty: 'medium',
        maxScore: 350,
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        requirements: JSON.stringify([
          'Create a product detail page with images',
          'Include product information (name, price, description)',
          'Add quantity selector and add to cart functionality',
          'Implement image gallery with thumbnails',
          'Add product reviews and ratings section',
          'Include related products section',
          'Add size/color selection if applicable',
          'Implement a shopping cart sidebar or modal',
          'Add responsive design for all screen sizes'
        ]),
        sampleOutput: 'A professional e-commerce product page with cart functionality',
        isUnlocked: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        title: 'Social Media Feed',
        description: 'Build a social media feed component with posts, likes, comments, and user interactions.',
        day: 7,
        difficulty: 'advanced',
        maxScore: 400,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        requirements: JSON.stringify([
          'Create a social media feed with posts',
          'Include user avatars and names',
          'Add like and comment functionality',
          'Implement post creation with text and image upload',
          'Add timestamp for posts',
          'Include post sharing functionality',
          'Add user profile pages',
          'Implement infinite scroll for feed',
          'Add real-time updates (optional with WebSocket)',
          'Include post editing and deletion for own posts'
        ]),
        sampleOutput: 'A social media feed with full interaction capabilities',
        isUnlocked: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        title: 'Real-time Chat Application',
        description: 'Build a real-time chat application with user authentication and message persistence.',
        day: 8,
        difficulty: 'advanced',
        maxScore: 450,
        deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 days from now
        requirements: JSON.stringify([
          'Implement user authentication system',
          'Create real-time messaging using WebSocket or Socket.io',
          'Add private messaging between users',
          'Include group chat functionality',
          'Add message timestamps and read receipts',
          'Implement file/image sharing in messages',
          'Add user online/offline status',
          'Include message search functionality',
          'Add emoji support in messages',
          'Implement message encryption (optional)'
        ]),
        sampleOutput: 'A fully functional real-time chat application',
        isUnlocked: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440009',
        title: 'Project Management Dashboard',
        description: 'Create a project management dashboard with task tracking, team collaboration, and progress monitoring.',
        day: 9,
        difficulty: 'advanced',
        maxScore: 500,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        requirements: JSON.stringify([
          'Create project creation and management',
          'Add task creation with assignees and due dates',
          'Implement Kanban board for task management',
          'Include progress tracking and analytics',
          'Add team member management',
          'Include file sharing and document management',
          'Add project timeline and milestones',
          'Implement real-time collaboration features',
          'Include project templates',
          'Add reporting and export functionality'
        ]),
        sampleOutput: 'A comprehensive project management dashboard',
        isUnlocked: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        title: 'AI-Powered Content Generator',
        description: 'Build an AI-powered content generator that creates articles, blog posts, or creative writing.',
        day: 10,
        difficulty: 'advanced',
        maxScore: 550,
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
        requirements: JSON.stringify([
          'Integrate with AI APIs (OpenAI, GPT, etc.)',
          'Create content generation interface',
          'Add different content types (articles, stories, poems)',
          'Include content customization options',
          'Add content history and saving',
          'Implement content editing and refinement',
          'Include plagiarism checking',
          'Add content export functionality',
          'Include user preferences and templates',
          'Add content rating and feedback system'
        ]),
        sampleOutput: 'An AI-powered content generation platform',
        isUnlocked: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Projects', projects, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Projects', null, {});
  }
}; 