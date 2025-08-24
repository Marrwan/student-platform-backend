const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ClassEnrollment = sequelize.define('ClassEnrollment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    classId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Classes', key: 'id' } },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    enrolledAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('active', 'inactive', 'dropped', 'completed'), defaultValue: 'active' },
    role: { type: DataTypes.ENUM('student', 'teaching_assistant'), defaultValue: 'student' },
    grade: { type: DataTypes.DECIMAL(5, 2), validate: { min: 0, max: 100 } },
    attendance: { type: DataTypes.INTEGER, defaultValue: 0 },
    attendanceScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0, validate: { min: 0, max: 100 } },
    lastActivity: { type: DataTypes.DATE },
    progress: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0, validate: { min: 0, max: 100 } },
    completedAssignments: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalAssignments: { type: DataTypes.INTEGER, defaultValue: 0 },
    averageScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    notes: { type: DataTypes.TEXT },
    settings: { type: DataTypes.JSONB, defaultValue: {} },
    invitedBy: { type: DataTypes.UUID, references: { model: 'Users', key: 'id' } },
    invitedAt: { type: DataTypes.DATE },
    acceptedAt: { type: DataTypes.DATE }
  }, {
    tableName: 'ClassEnrollments',
    indexes: [
      { unique: true, fields: ['classId', 'userId'] },
      { fields: ['status'] },
      { fields: ['enrolledAt'] },
      { fields: ['lastActivity'] }
    ]
  });

  ClassEnrollment.prototype.calculateProgress = function() {
    if (this.totalAssignments === 0) return 0;
    return Math.round((this.completedAssignments / this.totalAssignments) * 100);
  };

  ClassEnrollment.prototype.updateProgress = function() {
    this.progress = this.calculateProgress();
    return this.save();
  };

  ClassEnrollment.prototype.isActive = function() {
    return this.status === 'active';
  };

  ClassEnrollment.prototype.canAccess = function() {
    return this.isActive() && this.enrolledAt <= new Date();
  };

  ClassEnrollment.associate = (models) => {
    ClassEnrollment.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    ClassEnrollment.belongsTo(models.User, { foreignKey: 'userId', as: 'student' });
    ClassEnrollment.belongsTo(models.User, { foreignKey: 'invitedBy', as: 'inviter' });
    ClassEnrollment.hasMany(models.AssignmentSubmission, { foreignKey: 'enrollmentId', as: 'submissions' });
  };

  return ClassEnrollment;
}; 