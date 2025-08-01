const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    role: {
      type: DataTypes.ENUM('student', 'admin', 'partial_admin'),
      defaultValue: 'student'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false // Changed to false for email verification
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    emailVerificationToken: {
      type: DataTypes.STRING
    },
    emailVerificationExpires: {
      type: DataTypes.DATE
    },
    lastLogin: {
      type: DataTypes.DATE
    },
    resetPasswordToken: {
      type: DataTypes.STRING
    },
    resetPasswordExpires: {
      type: DataTypes.DATE
    },
    // Student progress tracking
    totalScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    streakCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    completedProjects: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    missedDeadlines: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Profile information
    avatar: {
      type: DataTypes.STRING
    },
    bio: {
      type: DataTypes.TEXT
    },
    githubUsername: {
      type: DataTypes.STRING
    },
    linkedinUrl: {
      type: DataTypes.STRING
    },
    // Settings
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    pushNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Admin permissions (for partial admins)
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {
        canCreateClasses: false,
        canManageStudents: false,
        canReviewSubmissions: false,
        canManageProjects: false,
        canViewAnalytics: false
      }
    },
    // Metadata
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  });

  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  User.prototype.isAdmin = function() {
    return this.role === 'admin' || this.role === 'partial_admin';
  };

  User.prototype.hasPermission = function(permission) {
    if (this.role === 'admin') return true;
    if (this.role === 'partial_admin') {
      return this.permissions && this.permissions[permission];
    }
    return false;
  };

  User.prototype.canCreateClasses = function() {
    return this.hasPermission('canCreateClasses');
  };

  User.prototype.canManageStudents = function() {
    return this.hasPermission('canManageStudents');
  };

  User.prototype.canReviewSubmissions = function() {
    return this.hasPermission('canReviewSubmissions');
  };

  User.prototype.canManageProjects = function() {
    return this.hasPermission('canManageProjects');
  };

  User.prototype.canViewAnalytics = function() {
    return this.hasPermission('canViewAnalytics');
  };

  User.associate = (models) => {
    User.hasMany(models.Submission, {
      foreignKey: 'userId',
      as: 'submissions'
    });
    User.hasMany(models.Class, {
      foreignKey: 'instructorId',
      as: 'instructedClasses'
    });
    User.hasMany(models.ClassEnrollment, {
      foreignKey: 'userId',
      as: 'enrollments'
    });
    User.hasMany(models.Challenge, {
      foreignKey: 'createdBy',
      as: 'createdChallenges'
    });
    User.hasMany(models.ChallengeRegistration, {
      foreignKey: 'userId',
      as: 'challengeRegistrations'
    });
    User.hasMany(models.ChallengeLeaderboard, {
      foreignKey: 'userId',
      as: 'leaderboardEntries'
    });
    User.hasMany(models.Payment, {
      foreignKey: 'userId',
      as: 'payments'
    });
  };

  return User;
}; 