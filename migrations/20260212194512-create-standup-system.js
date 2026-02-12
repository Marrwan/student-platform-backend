'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Standups table
    await queryInterface.createTable('Standups', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      scheduledFor: {
        type: Sequelize.DATE,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
      teamId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed'),
        defaultValue: 'scheduled'
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

    // Create StandupResponses table
    await queryInterface.createTable('StandupResponses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      standupId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Standups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      whatDidYouDo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      whatWillYouDo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      blockers: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      attendanceStatus: {
        type: Sequelize.ENUM('present', 'absent', 'late'),
        defaultValue: 'present'
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Create ActionItems table
    await queryInterface.createTable('ActionItems', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      standupId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Standups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assignedTo: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed'),
        defaultValue: 'pending'
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('Standups', ['scheduledFor']);
    await queryInterface.addIndex('Standups', ['createdBy']);
    await queryInterface.addIndex('Standups', ['teamId']);
    await queryInterface.addIndex('StandupResponses', ['standupId']);
    await queryInterface.addIndex('StandupResponses', ['userId']);
    await queryInterface.addIndex('ActionItems', ['standupId']);
    await queryInterface.addIndex('ActionItems', ['assignedTo']);
    await queryInterface.addIndex('ActionItems', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ActionItems');
    await queryInterface.dropTable('StandupResponses');
    await queryInterface.dropTable('Standups');
  }
};
