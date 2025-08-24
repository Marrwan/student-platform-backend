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
      allowNull: false
    },
    sampleOutput: {
      type: DataTypes.TEXT
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
    starterCode: {
      type: DataTypes.JSONB,
      defaultValue: {
        html: '',
        css: '',
        javascript: ''
      }
    },
    hints: {
      type: DataTypes.TEXT
    },
    resources: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    submissionTypes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['github', 'code', 'zip'],
      validate: {
        isValidSubmissionTypes(value) {
          const validTypes = ['github', 'code', 'zip'];
          if (!value.every(type => validTypes.includes(type))) {
            throw new Error('Invalid submission type');
          }
        }
      }
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
    requirePayment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lateFeeAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 500 // ₦500
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
    if (!this.isUnlocked) return false;
    if (!this.isActive) return false;
    
    const now = new Date();
    const startDate = new Date(this.startDate);
    
    if (now < startDate) return false;
    
    if (this.allowLateSubmission) {
      const maxLateTime = new Date(this.deadline);
      maxLateTime.setHours(maxLateTime.getHours() + this.maxLateHours);
      return now <= maxLateTime;
    }
    
    return now <= this.deadline;
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