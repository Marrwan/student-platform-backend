'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WeeklyAttendances', {
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
      weekStartDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Start date of the week (Monday)'
      },
      weekEndDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'End date of the week (Sunday)'
      },
      monday: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Attendance for Monday'
      },
      tuesday: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Attendance for Tuesday'
      },
      wednesday: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Attendance for Wednesday'
      },
      thursday: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Attendance for Thursday'
      },
      friday: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Attendance for Friday'
      },
      saturday: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Attendance for Saturday'
      },
      sunday: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Attendance for Sunday'
      },
      totalDaysPresent: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 7
        }
      },
      totalDaysInWeek: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
        validate: {
          min: 1,
          max: 7
        },
        comment: 'Number of class days in this week (default 5 for weekdays)'
      },
      attendancePercentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      notes: {
        type: Sequelize.TEXT,
        comment: 'Additional notes for the week'
      },
      markedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      markedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('WeeklyAttendances', ['classId']);
    await queryInterface.addIndex('WeeklyAttendances', ['userId']);
    await queryInterface.addIndex('WeeklyAttendances', ['weekStartDate']);
    await queryInterface.addIndex('WeeklyAttendances', ['weekEndDate']);
    await queryInterface.addIndex('WeeklyAttendances', ['markedBy']);
    
    // Add unique constraint
    await queryInterface.addIndex('WeeklyAttendances', ['classId', 'userId', 'weekStartDate'], {
      unique: true,
      name: 'weekly_attendance_unique_constraint'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WeeklyAttendances');
  }
};
