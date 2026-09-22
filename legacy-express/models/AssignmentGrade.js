const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AssignmentGrade = sequelize.define('AssignmentGrade', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    assignmentId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Assignments', key: 'id' } },
    enrollmentId: { type: DataTypes.UUID, allowNull: false, references: { model: 'ClassEnrollments', key: 'id' } },
    score: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0, validate: { min: 0, max: 1000 } },
    maxScore: { type: DataTypes.INTEGER, defaultValue: 100 },
    percentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    letterGrade: { type: DataTypes.STRING, defaultValue: 'F' },
    feedback: { type: DataTypes.TEXT },
    gradedBy: { type: DataTypes.UUID, references: { model: 'Users', key: 'id' } },
    gradedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    rubricScores: { type: DataTypes.JSONB, defaultValue: {} },
    comments: { type: DataTypes.TEXT },
    isLate: { type: DataTypes.BOOLEAN, defaultValue: false },
    latePenalty: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    finalScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    metadata: { type: DataTypes.JSONB, defaultValue: {} }
  }, {
    indexes: [
      { unique: true, fields: ['assignmentId', 'enrollmentId'] },
      { fields: ['gradedAt'] },
      { fields: ['letterGrade'] },
      { fields: ['percentage'] }
    ]
  });

  AssignmentGrade.prototype.calculatePercentage = function() {
    if (this.maxScore === 0) return 0;
    return (this.score / this.maxScore) * 100;
  };

  AssignmentGrade.prototype.calculateLetterGrade = function() {
    const percentage = this.calculatePercentage();
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  AssignmentGrade.prototype.calculateFinalScore = function() {
    let finalScore = this.score;
    if (this.isLate) {
      finalScore = Math.max(0, finalScore - this.latePenalty);
    }
    this.finalScore = finalScore;
    return finalScore;
  };

  AssignmentGrade.prototype.updateGrade = function() {
    this.percentage = this.calculatePercentage();
    this.letterGrade = this.calculateLetterGrade();
    this.calculateFinalScore();
    return this.save();
  };

  AssignmentGrade.associate = (models) => {
    AssignmentGrade.belongsTo(models.Assignment, { foreignKey: 'assignmentId', as: 'assignment' });
    AssignmentGrade.belongsTo(models.ClassEnrollment, { foreignKey: 'enrollmentId', as: 'enrollment' });
    AssignmentGrade.belongsTo(models.User, { foreignKey: 'gradedBy', as: 'grader' });
  };

  return AssignmentGrade;
}; 