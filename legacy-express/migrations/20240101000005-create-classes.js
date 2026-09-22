'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Classes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { len: [2, 100] }
      },
      description: {
        type: Sequelize.TEXT
      },
      instructorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      maxStudents: {
        type: Sequelize.INTEGER,
        defaultValue: 50,
        validate: { min: 1, max: 1000 }
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      enrollmentCode: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      syllabus: {
        type: Sequelize.TEXT
      },
      requirements: {
        type: Sequelize.TEXT
      },
      schedule: {
        type: Sequelize.JSONB
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      category: {
        type: Sequelize.STRING,
        defaultValue: 'programming'
      },
      level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'beginner'
      },
      language: {
        type: Sequelize.STRING,
        defaultValue: 'en'
      },
      timezone: {
        type: Sequelize.STRING,
        defaultValue: 'UTC'
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      allowEnrollment: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      autoEnroll: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      notificationSettings: {
        type: Sequelize.JSONB,
        defaultValue: { email: true, push: true }
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
    await queryInterface.addIndex('Classes', ['enrollmentCode'], { unique: true });
    await queryInterface.addIndex('Classes', ['instructorId']);
    await queryInterface.addIndex('Classes', ['isActive']);
    await queryInterface.addIndex('Classes', ['startDate']);
    await queryInterface.addIndex('Classes', ['category']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Classes');
  }
}; 