const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Assignment = sequelize.define('Assignment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('html', 'css', 'javascript', 'fullstack', 'other'),
      defaultValue: 'fullstack'
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard', 'advanced'),
      defaultValue: 'easy'
    },
    maxScore: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      validate: {
        min: 1,
        max: 1000
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isUnlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sampleOutputUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    sampleOutputCode: {
      type: DataTypes.JSONB,
      defaultValue: {
        html: '',
        css: '',
        javascript: ''
      }
    },
    submissionMode: {
      type: DataTypes.ENUM('code', 'link', 'both'),
      defaultValue: 'both',
      allowNull: false
    },
    paymentRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    paymentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 500,
      allowNull: false
    },
    latePenalty: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10,
      validate: {
        min: 0,
        max: 100
      }
    },
    allowLateSubmission: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    maxLateHours: {
      type: DataTypes.INTEGER,
      defaultValue: 24
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    indexes: [
      { fields: ['classId'] },
      { fields: ['isUnlocked'] },
      { fields: ['deadline'] },
      { fields: ['type'] },
      { fields: ['difficulty'] },
      { fields: ['startDate'] }
    ]
  });

  Assignment.prototype.isOverdue = function() {
    return new Date() > this.deadline;
  };

  Assignment.prototype.isDueToday = function() {
    const today = new Date();
    const deadline = new Date(this.deadline);
    return today.toDateString() === deadline.toDateString();
  };

  Assignment.prototype.getTimeRemaining = function() {
    const now = new Date();
    const timeRemaining = this.deadline - now;
    return timeRemaining > 0 ? timeRemaining : 0;
  };

  Assignment.prototype.canSubmit = function() {
    if (!this.isActive) return false;
    
    const now = new Date();
    const startDate = new Date(this.startDate);
    
    // Cannot submit before start time
    if (now < startDate) return false;
    
    // If late submissions are allowed, can submit anytime after start
    if (this.allowLateSubmission) {
      return true;
    }
    
    // If late submissions are not allowed, can only submit before deadline
    return now <= this.deadline;
  };

  Assignment.prototype.isAvailable = function() {
    if (!this.isActive) return false;
    
    // Students can access assignment details at any time
    return true;
  };

  Assignment.prototype.getStatus = function() {
    if (!this.isActive) return 'inactive';
    
    const now = new Date();
    const startDate = new Date(this.startDate);
    const deadline = new Date(this.deadline);
    
    if (now < startDate) return 'not_started';
    if (now > deadline) return 'overdue';
    return 'active';
  };

  Assignment.prototype.calculateLatePenalty = function(submittedAt) {
    if (!this.allowLateSubmission || submittedAt <= this.deadline) return 0;
    
    const hoursLate = (submittedAt - this.deadline) / (1000 * 60 * 60);
    if (this.maxLateHours && hoursLate > this.maxLateHours) return this.maxScore;
    
    return Math.min(this.latePenalty * hoursLate, this.maxScore);
  };

  Assignment.associate = (models) => {
    Assignment.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class'
    });
    Assignment.hasMany(models.AssignmentSubmission, {
      foreignKey: 'assignmentId',
      as: 'submissions'
    });
  };

  return Assignment;
}; 