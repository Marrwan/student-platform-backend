'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AttendanceScores', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
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
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      maxScore: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100
      },
      attendanceDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      awardedBy: {
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
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('AttendanceScores', ['classId']);
    await queryInterface.addIndex('AttendanceScores', ['userId']);
    await queryInterface.addIndex('AttendanceScores', ['awardedBy']);
    await queryInterface.addIndex('AttendanceScores', ['attendanceDate']);
    
    // Add unique constraint to prevent duplicate attendance records for same user in same class on same date
    await queryInterface.addIndex('AttendanceScores', ['classId', 'userId', 'attendanceDate'], {
      unique: true,
      name: 'attendance_scores_unique_user_class_date'
    });

    console.log('✅ Created AttendanceScores table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AttendanceScores');
    console.log('✅ Dropped AttendanceScores table');
  }
};
