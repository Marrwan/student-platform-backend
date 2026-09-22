const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Submission = sequelize.define('Submission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    githubLink: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    codeSubmission: {
      type: DataTypes.TEXT
    },
    zipFileUrl: {
      type: DataTypes.STRING
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'accepted', 'rejected'),
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
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'projectId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['submittedAt']
      }
    ]
  });

  Submission.prototype.calculateFinalScore = function() {
    let finalScore = this.score + this.bonusPoints - this.deductions - this.latePenalty;
    return Math.max(0, finalScore);
  };

  Submission.prototype.isOnTime = function() {
    const project = this.Project;
    if (!project) return false;
    return this.submittedAt <= project.deadline;
  };

  Submission.prototype.getLatePenalty = function() {
    if (this.isOnTime()) return 0;
    
    const project = this.Project;
    if (!project) return 0;
    
    const hoursLate = (this.submittedAt - project.deadline) / (1000 * 60 * 60);
    
    if (hoursLate <= 24) {
      return Math.floor(project.maxScore * 0.1); // 10% penalty for first 24 hours
    } else if (hoursLate <= 48) {
      return Math.floor(project.maxScore * 0.25); // 25% penalty for 24-48 hours
    } else {
      return project.maxScore; // 100% penalty after 48 hours
    }
  };

  Submission.associate = (models) => {
    Submission.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Submission.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project'
    });
    
    Submission.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer'
    });

    Submission.hasMany(models.Payment, {
      foreignKey: 'submissionId',
      as: 'payments'
    });
  };

  return Submission;
}; 