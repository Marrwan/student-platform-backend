'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Challenges', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { len: [3, 100] }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('javascript', 'python', 'react', 'nodejs', 'custom'),
        defaultValue: 'javascript'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        validate: { min: 1, max: 365 }
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      allowRegistration: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      maxParticipants: {
        type: Sequelize.INTEGER,
        defaultValue: 1000,
        validate: { min: 1, max: 10000 }
      },
      currentParticipants: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      autoStart: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      autoUnlockProjects: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      unlockTime: {
        type: Sequelize.TIME,
        defaultValue: '00:00:00'
      },
      timezone: {
        type: Sequelize.STRING,
        defaultValue: 'UTC'
      },
      scoringSystem: {
        type: Sequelize.ENUM('points', 'percentage', 'stars'),
        defaultValue: 'points'
      },
      maxScore: {
        type: Sequelize.INTEGER,
        defaultValue: 3000
      },
      bonusPoints: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      streakBonus: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 10,
        validate: { min: 0, max: 100 }
      },
      latePenalty: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 10,
        validate: { min: 0, max: 100 }
      },
      allowLateSubmission: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      maxLateHours: {
        type: Sequelize.INTEGER,
        defaultValue: 24
      },
      hasLeaderboard: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      hasCertificates: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      hasProgressTracking: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      hasNotifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      hasDiscussions: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      hasMentorship: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      welcomeMessage: {
        type: Sequelize.TEXT
      },
      rules: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      prizes: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      sponsors: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      totalSubmissions: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      averageCompletionRate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      averageScore: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      moderators: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        defaultValue: []
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'active', 'paused', 'completed', 'archived'),
        defaultValue: 'draft'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('Challenges', ['isActive']);
    await queryInterface.addIndex('Challenges', ['isPublic']);
    await queryInterface.addIndex('Challenges', ['startDate']);
    await queryInterface.addIndex('Challenges', ['endDate']);
    await queryInterface.addIndex('Challenges', ['type']);
    await queryInterface.addIndex('Challenges', ['status']);
    await queryInterface.addIndex('Challenges', ['createdBy']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Challenges');
  }
}; 