const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    day: { type: DataTypes.INTEGER, allowNull: false, unique: true, validate: { min: 1, max: 30 } },
    title: { type: DataTypes.STRING, allowNull: false, validate: { len: [3, 200] } },
    description: { type: DataTypes.TEXT, allowNull: false },
    requirements: { type: DataTypes.TEXT, allowNull: false },
    difficulty: { type: DataTypes.ENUM('easy', 'medium', 'hard', 'advanced'), defaultValue: 'easy' },
    maxScore: { type: DataTypes.INTEGER, defaultValue: 100, validate: { min: 1, max: 1000 } },
    deadline: { type: DataTypes.DATE, allowNull: false },
    isUnlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    sampleOutput: { type: DataTypes.TEXT },
    starterCode: { type: DataTypes.TEXT },
    hints: { type: DataTypes.TEXT },
    tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    estimatedTime: { type: DataTypes.INTEGER, defaultValue: 60 },
    // Challenge management features
    challengeId: { type: DataTypes.UUID, references: { model: 'Challenges', key: 'id' } },
    startDate: { type: DataTypes.DATE },
    endDate: { type: DataTypes.DATE },
    autoUnlock: { type: DataTypes.BOOLEAN, defaultValue: true },
    unlockTime: { type: DataTypes.TIME, defaultValue: '00:00:00' },
    unlockDelay: { type: DataTypes.INTEGER, defaultValue: 0 }, // hours after previous project
    prerequisites: { type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: [] }, // required completed days
    bonusPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
    penaltyPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
    latePenalty: { type: DataTypes.DECIMAL(5, 2), defaultValue: 10, validate: { min: 0, max: 100 } },
    allowLateSubmission: { type: DataTypes.BOOLEAN, defaultValue: true },
    maxLateHours: { type: DataTypes.INTEGER, defaultValue: 24 },
    submissionLimit: { type: DataTypes.INTEGER, defaultValue: 1, validate: { min: 1, max: 10 } },
    // Enhanced content
    videoUrl: { type: DataTypes.STRING },
    resources: { type: DataTypes.JSONB, defaultValue: [] },
    learningObjectives: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    skillsPracticed: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    // Interactive features
    hasLivePreview: { type: DataTypes.BOOLEAN, defaultValue: true },
    hasCodeEditor: { type: DataTypes.BOOLEAN, defaultValue: true },
    hasAutoTest: { type: DataTypes.BOOLEAN, defaultValue: false },
    testCases: { type: DataTypes.JSONB, defaultValue: [] },
    // Statistics
    totalSubmissions: { type: DataTypes.INTEGER, defaultValue: 0 },
    averageScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    completionRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    averageTimeSpent: { type: DataTypes.INTEGER, defaultValue: 0 }, // minutes
    // Settings
    settings: { type: DataTypes.JSONB, defaultValue: {} },
    metadata: { type: DataTypes.JSONB, defaultValue: {} }
  }, { 
    indexes: [
      { unique: true, fields: ['day'] },
      { fields: ['isUnlocked'] },
      { fields: ['deadline'] },
      { fields: ['difficulty'] },
      { fields: ['challengeId'] },
      { fields: ['startDate'] },
      { fields: ['endDate'] }
    ]
  });

  Project.prototype.isOverdue = function() {
    return new Date() > this.deadline;
  };

  Project.prototype.isDueToday = function() {
    const today = new Date();
    const deadline = new Date(this.deadline);
    return today.toDateString() === deadline.toDateString();
  };

  Project.prototype.getTimeRemaining = function() {
    const now = new Date();
    const timeRemaining = this.deadline - now;
    return timeRemaining > 0 ? timeRemaining : 0;
  };

  Project.prototype.canUnlock = function(completedDays = []) {
    if (!this.autoUnlock) return false;
    
    // Check prerequisites
    if (this.prerequisites.length > 0) {
      const hasPrerequisites = this.prerequisites.every(day => completedDays.includes(day));
      if (!hasPrerequisites) return false;
    }
    
    return true;
  };

  Project.prototype.shouldUnlock = function(completedDays = []) {
    if (!this.canUnlock(completedDays)) return false;
    
    const now = new Date();
    const startDate = this.startDate ? new Date(this.startDate) : null;
    
    if (startDate && now < startDate) return false;
    
    // Check unlock time
    if (this.unlockTime) {
      const [hours, minutes] = this.unlockTime.split(':');
      const unlockDateTime = new Date();
      unlockDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (now < unlockDateTime) return false;
    }
    
    return true;
  };

  Project.prototype.calculateLatePenalty = function(submittedAt) {
    if (!this.allowLateSubmission || submittedAt <= this.deadline) return 0;
    
    const hoursLate = (submittedAt - this.deadline) / (1000 * 60 * 60);
    if (this.maxLateHours && hoursLate > this.maxLateHours) return this.maxScore;
    
    return Math.min(this.latePenalty * hoursLate, this.maxScore);
  };

  Project.prototype.getDifficultyColor = function() {
    switch (this.difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'yellow';
      case 'hard': return 'orange';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  Project.prototype.updateStatistics = function() {
    // This would be called after submissions are processed
    // Implementation would calculate totalSubmissions, averageScore, etc.
  };

  Project.associate = (models) => {
    Project.hasMany(models.Submission, { foreignKey: 'projectId', as: 'submissions' });
    Project.belongsTo(models.Challenge, { foreignKey: 'challengeId', as: 'challenge' });
    Project.hasMany(models.ProjectResource, { foreignKey: 'projectId', as: 'projectResources' });
    Project.hasMany(models.ProjectTest, { foreignKey: 'projectId', as: 'projectTests' });
  };

  return Project;
}; 