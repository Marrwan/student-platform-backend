const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WeeklyAttendance = sequelize.define('WeeklyAttendance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    weekStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Start date of the week (Monday)'
    },
    weekEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'End date of the week (Sunday)'
    },
    monday: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Attendance for Monday'
    },
    tuesday: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Attendance for Tuesday'
    },
    wednesday: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Attendance for Wednesday'
    },
    thursday: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Attendance for Thursday'
    },
    friday: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Attendance for Friday'
    },
    saturday: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Attendance for Saturday'
    },
    sunday: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Attendance for Sunday'
    },
    totalDaysPresent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 7
      }
    },
    totalDaysInWeek: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      validate: {
        min: 1,
        max: 7
      },
      comment: 'Number of class days in this week (default 5 for weekdays)'
    },
    attendancePercentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Additional notes for the week'
    },
    markedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    markedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    indexes: [
      { fields: ['classId'] },
      { fields: ['userId'] },
      { fields: ['weekStartDate'] },
      { fields: ['weekEndDate'] },
      { fields: ['markedBy'] },
      {
        unique: true,
        fields: ['classId', 'userId', 'weekStartDate']
      }
    ]
  });

  WeeklyAttendance.associate = (models) => {
    WeeklyAttendance.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class'
    });
    
    WeeklyAttendance.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    WeeklyAttendance.belongsTo(models.User, {
      foreignKey: 'markedBy',
      as: 'markedByUser'
    });
  };

  // Instance method to calculate attendance percentage
  WeeklyAttendance.prototype.calculateAttendance = function() {
    const daysPresent = [
      this.monday, this.tuesday, this.wednesday, 
      this.thursday, this.friday, this.saturday, this.sunday
    ].filter(day => day).length;
    
    this.totalDaysPresent = daysPresent;
    this.attendancePercentage = this.totalDaysInWeek > 0 
      ? (daysPresent / this.totalDaysInWeek) * 100 
      : 0;
    
    return this.attendancePercentage;
  };

  // Instance method to get week range
  WeeklyAttendance.prototype.getWeekRange = function() {
    return {
      start: this.weekStartDate,
      end: this.weekEndDate
    };
  };

  return WeeklyAttendance;
};
