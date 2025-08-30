const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    assignmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Assignments',
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
    submissionType: {
      type: DataTypes.ENUM('github', 'code', 'zip', 'link'),
      allowNull: false
    },
    githubLink: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    submissionLink: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    codeSubmission: {
      type: DataTypes.JSONB,
      defaultValue: {
        html: '',
        css: '',
        javascript: ''
      }
    },
    zipFileUrl: {
      type: DataTypes.STRING
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'accepted'),
      defaultValue: 'pending'
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 1000
      }
    },
    isLate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    latePenalty: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    adminFeedback: {
      type: DataTypes.TEXT
    },
    adminComments: {
      type: DataTypes.TEXT
    },
    reviewedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    reviewedAt: {
      type: DataTypes.DATE
    },
    bonusPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    deductions: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    finalScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending',
      allowNull: false
    },
    paymentAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false
    },
    paymentReference: {
      type: DataTypes.STRING
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    blockReason: {
      type: DataTypes.TEXT
    },
    requestCorrection: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'assignmentId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['submittedAt']
      },
      {
        fields: ['assignmentId']
      },
      {
        fields: ['userId']
      }
    ]
  });

  AssignmentSubmission.prototype.calculateFinalScore = function() {
    let finalScore = this.score + this.bonusPoints - this.deductions - this.latePenalty;
    return Math.max(0, finalScore);
  };

  AssignmentSubmission.prototype.isOnTime = function() {
    const assignment = this.Assignment;
    if (!assignment) return false;
    return this.submittedAt <= assignment.deadline;
  };

  AssignmentSubmission.prototype.getLatePenalty = function() {
    if (this.isOnTime()) return 0;
    
    const assignment = this.Assignment;
    if (!assignment) return 0;
    
    const hoursLate = (this.submittedAt - assignment.deadline) / (1000 * 60 * 60);
    
    if (hoursLate <= 24) {
      return Math.floor(assignment.maxScore * (assignment.latePenalty / 100));
    } else if (hoursLate <= 48) {
      return Math.floor(assignment.maxScore * 0.25);
    } else {
      return assignment.maxScore;
    }
  };

  AssignmentSubmission.associate = (models) => {
    AssignmentSubmission.belongsTo(models.Assignment, {
      foreignKey: 'assignmentId',
      as: 'assignment'
    });
    
    AssignmentSubmission.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    AssignmentSubmission.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer'
    });

    AssignmentSubmission.hasMany(models.Payment, {
      foreignKey: 'submissionId',
      as: 'payments'
    });
  };

  return AssignmentSubmission;
}; 