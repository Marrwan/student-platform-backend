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
    },
    // HRMS Fields
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Departments',
        key: 'id'
      }
    },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    jobTitle: {
      type: DataTypes.STRING // e.g., "Backend Engineer", "Senior Analyst 1"
    },
    staffRole: {
      type: DataTypes.STRING // Internal level: "Intern", "Analyst", "Manager"
    },
    location: {
      type: DataTypes.STRING
    },
    // Team Association
    teamId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Teams',
        key: 'id'
      }
    },
    // Status
    onLeave: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isOnSuspension: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    joinedAt: {
      type: DataTypes.DATE
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

  User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.getFullName = function () {
    return `${this.firstName} ${this.lastName}`;
  };

  User.prototype.isAdmin = function () {
    return this.role === 'admin' || this.role === 'partial_admin';
  };

  User.prototype.hasPermission = function (permission) {
    if (this.role === 'admin') return true;
    if (this.role === 'partial_admin') {
      return this.permissions && this.permissions[permission];
    }
    return false;
  };

  User.prototype.canCreateClasses = function () {
    return this.hasPermission('canCreateClasses');
  };

  User.prototype.canManageStudents = function () {
    return this.hasPermission('canManageStudents');
  };

  User.prototype.canReviewSubmissions = function () {
    return this.hasPermission('canReviewSubmissions');
  };

  User.prototype.canManageProjects = function () {
    return this.hasPermission('canManageProjects');
  };

  User.prototype.canViewAnalytics = function () {
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

    // HRMS Associations
    User.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department'
    });
    User.belongsTo(models.Team, {
      foreignKey: 'teamId',
      as: 'team'
    });
    User.belongsTo(models.User, {
      foreignKey: 'managerId',
      as: 'manager'
    });
    User.hasMany(models.User, {
      foreignKey: 'managerId',
      as: 'directReports'
    });
    User.hasMany(models.Appraisal, {
      foreignKey: 'userId',
      as: 'myAppraisals'
    });
    User.hasMany(models.Appraisal, {
      foreignKey: 'reviewerId',
      as: 'reviewsToConduct'
    });

    // RBAC Associations
    User.belongsToMany(models.Role, {
      through: 'UserRole',
      foreignKey: 'userId',
      as: 'roles'
    });
    User.belongsToMany(models.Permission, {
      through: 'UserPermission',
      foreignKey: 'userId',
      as: 'userPermissions'
    });
  };

  // Helper to check if user has a specific permission (either directly or via roles)
  User.prototype.hasPermissionTo = async function (permissionName) {
    // Super admin check (legacy role string or new role)
    if (this.role === 'admin') return true;

    // Check direct user permissions if loaded
    if (this.userPermissions && this.userPermissions.some(p => p.name === permissionName)) {
      return true;
    }

    // Check role permissions if loaded
    if (this.roles) {
      for (const role of this.roles) {
        if (role.name === 'Super Admin') return true; // Hardcoded super admin check
        if (role.permissions && role.permissions.some(p => p.name === permissionName)) {
          return true;
        }
      }
    }

    // Fallback to legacy check if new system data isn't loaded/migrated yet
    if (this.role === 'partial_admin' && this.permissions && this.permissions[permissionName]) {
      return true;
    }

    return false;
  };

  return User;
}; 