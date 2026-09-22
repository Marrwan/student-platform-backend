const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Challenge = sequelize.define('Challenge', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { len: [3, 100] } },
    description: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('javascript', 'python', 'react', 'nodejs', 'custom'), defaultValue: 'javascript' },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    duration: { type: DataTypes.INTEGER, defaultValue: 30, validate: { min: 1, max: 365 } }, // days
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
    allowRegistration: { type: DataTypes.BOOLEAN, defaultValue: true },
    maxParticipants: { type: DataTypes.INTEGER, defaultValue: 1000, validate: { min: 1, max: 10000 } },
    currentParticipants: { type: DataTypes.INTEGER, defaultValue: 0 },
    // Challenge settings
    autoStart: { type: DataTypes.BOOLEAN, defaultValue: true },
    autoUnlockProjects: { type: DataTypes.BOOLEAN, defaultValue: true },
    unlockTime: { type: DataTypes.TIME, defaultValue: '00:00:00' },
    timezone: { type: DataTypes.STRING, defaultValue: 'UTC' },
    // Scoring and rules
    scoringSystem: { type: DataTypes.ENUM('points', 'percentage', 'stars'), defaultValue: 'points' },
    maxScore: { type: DataTypes.INTEGER, defaultValue: 3000 }, // 30 projects * 100 points
    bonusPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
    streakBonus: { type: DataTypes.DECIMAL(5, 2), defaultValue: 10, validate: { min: 0, max: 100 } },
    latePenalty: { type: DataTypes.DECIMAL(5, 2), defaultValue: 10, validate: { min: 0, max: 100 } },
    allowLateSubmission: { type: DataTypes.BOOLEAN, defaultValue: true },
    maxLateHours: { type: DataTypes.INTEGER, defaultValue: 24 },
    // Features
    hasLeaderboard: { type: DataTypes.BOOLEAN, defaultValue: true },
    hasCertificates: { type: DataTypes.BOOLEAN, defaultValue: true },
    hasProgressTracking: { type: DataTypes.BOOLEAN, defaultValue: true },
    hasNotifications: { type: DataTypes.BOOLEAN, defaultValue: true },
    hasDiscussions: { type: DataTypes.BOOLEAN, defaultValue: false },
    hasMentorship: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Content
    welcomeMessage: { type: DataTypes.TEXT },
    rules: { type: DataTypes.JSONB, defaultValue: [] },
    prizes: { type: DataTypes.JSONB, defaultValue: [] },
    sponsors: { type: DataTypes.JSONB, defaultValue: [] },
    // Statistics
    totalSubmissions: { type: DataTypes.INTEGER, defaultValue: 0 },
    averageCompletionRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    averageScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    // Settings
    settings: { type: DataTypes.JSONB, defaultValue: {} },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
    // Admin
    createdBy: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    moderators: { type: DataTypes.ARRAY(DataTypes.UUID), defaultValue: [] },
    // Status
    status: { type: DataTypes.ENUM('draft', 'published', 'active', 'paused', 'completed', 'archived'), defaultValue: 'draft' }
  }, {
    indexes: [
      { fields: ['isActive'] },
      { fields: ['isPublic'] },
      { fields: ['startDate'] },
      { fields: ['endDate'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['createdBy'] }
    ]
  });

  Challenge.prototype.isRegistrationOpen = function() {
    const now = new Date();
    return this.allowRegistration && this.getDataValue('isActive') && now < this.startDate;
  };

  Challenge.prototype.isCurrentlyActive = function() {
    const now = new Date();
    return this.getDataValue('isActive') && now >= this.startDate && now <= this.endDate;
  };

  Challenge.prototype.getStatus = function() {
    const now = new Date();
    if (!this.getDataValue('isActive')) return 'inactive';
    if (now < this.startDate) return 'upcoming';
    if (now > this.endDate) return 'ended';
    return 'active';
  };

  Challenge.prototype.getProgress = function() {
    const now = new Date();
    const totalDuration = this.endDate - this.startDate;
    const elapsed = now - this.startDate;
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  Challenge.prototype.canJoin = function(userId) {
    if (!this.isRegistrationOpen()) return false;
    if (this.currentParticipants >= this.maxParticipants) return false;
    return true;
  };

  Challenge.prototype.getCurrentDay = function() {
    const now = new Date();
    if (now < this.startDate) return 0;
    if (now > this.endDate) return this.duration;
    
    const elapsed = now - this.startDate;
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    return Math.min(days + 1, this.duration);
  };

  Challenge.prototype.shouldUnlockProject = function(day) {
    if (!this.autoUnlockProjects) return false;
    
    const currentDay = this.getCurrentDay();
    return currentDay >= day;
  };

  Challenge.prototype.getLeaderboardSettings = function() {
    return {
      enabled: this.hasLeaderboard,
      scoringSystem: this.scoringSystem,
      maxScore: this.maxScore,
      streakBonus: this.streakBonus
    };
  };

  Challenge.associate = (models) => {
    Challenge.hasMany(models.Project, { foreignKey: 'challengeId', as: 'projects' });
    Challenge.hasMany(models.ChallengeRegistration, { foreignKey: 'challengeId', as: 'registrations' });
    Challenge.hasMany(models.ChallengeAnnouncement, { foreignKey: 'challengeId', as: 'announcements' });
    Challenge.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    Challenge.hasMany(models.ChallengeLeaderboard, { foreignKey: 'challengeId', as: 'leaderboard' });
  };

  return Challenge;
}; 