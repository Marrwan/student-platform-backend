const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 100]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    instructorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    enrollmentCode: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
      validate: {
        min: 1,
        max: 200
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        allowLateSubmissions: true,
        latePenalty: 10,
        maxLateHours: 24,
        requireApproval: false,
        allowStudentInvites: false,
        notificationSettings: {
          email: true,
          push: true
        }
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    indexes: [
      { fields: ['instructorId'] },
      { fields: ['enrollmentCode'] },
      { fields: ['isActive'] },
      { fields: ['startDate'] },
      { fields: ['endDate'] }
    ]
  });

  Class.prototype.generateEnrollmentCode = function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  Class.prototype.isEnrollmentOpen = function() {
    if (!this.isActive) return false;
    if (this.endDate && new Date() > this.endDate) return false;
    return true;
  };

  Class.prototype.canEnroll = function(currentStudentCount) {
    return this.isEnrollmentOpen() && currentStudentCount < this.maxStudents;
  };

  Class.associate = (models) => {
    Class.belongsTo(models.User, {
      foreignKey: 'instructorId',
      as: 'instructor'
    });
    Class.hasMany(models.ClassEnrollment, {
      foreignKey: 'classId',
      as: 'enrollments'
    });
    Class.hasMany(models.Assignment, {
      foreignKey: 'classId',
      as: 'assignments'
    });
    Class.hasMany(models.Challenge, {
      foreignKey: 'classId',
      as: 'challenges'
    });
  };

  return Class;
}; 