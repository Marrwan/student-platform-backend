'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Assignments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      classId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('html', 'css', 'javascript', 'fullstack', 'other'),
        defaultValue: 'fullstack'
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard', 'advanced'),
        defaultValue: 'easy'
      },
      maxScore: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isUnlocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      requirements: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      sampleOutput: {
        type: Sequelize.TEXT
      },
      starterCode: {
        type: Sequelize.JSONB,
        defaultValue: {
          html: '',
          css: '',
          javascript: ''
        }
      },
      hints: {
        type: Sequelize.TEXT
      },
      resources: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      submissionTypes: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: ['github', 'code', 'zip']
      },
      latePenalty: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 10
      },
      allowLateSubmission: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      maxLateHours: {
        type: Sequelize.INTEGER,
        defaultValue: 24
      },
      requirePayment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      lateFeeAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 500
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('Assignments', ['classId']);
    await queryInterface.addIndex('Assignments', ['isUnlocked']);
    await queryInterface.addIndex('Assignments', ['deadline']);
    await queryInterface.addIndex('Assignments', ['type']);
    await queryInterface.addIndex('Assignments', ['difficulty']);
    await queryInterface.addIndex('Assignments', ['startDate']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Assignments');
  }
}; 