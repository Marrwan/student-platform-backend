const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChallengeRegistration = sequelize.define('ChallengeRegistration', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    challengeId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Challenges', key: 'id' } },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    registeredAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('active', 'inactive', 'dropped', 'completed'), defaultValue: 'active' },
    totalScore: { type: DataTypes.INTEGER, defaultValue: 0 },
    completedProjects: { type: DataTypes.INTEGER, defaultValue: 0 },
    streakCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastSubmissionAt: { type: DataTypes.DATE },
    startDate: { type: DataTypes.DATE },
    endDate: { type: DataTypes.DATE },
    progress: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0, validate: { min: 0, max: 100 } },
    averageScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    rank: { type: DataTypes.INTEGER },
    certificateEarned: { type: DataTypes.BOOLEAN, defaultValue: false },
    certificateUrl: { type: DataTypes.STRING },
    settings: { type: DataTypes.JSONB, defaultValue: {} },
    metadata: { type: DataTypes.JSONB, defaultValue: {} }
  }, {
    indexes: [
      { unique: true, fields: ['challengeId', 'userId'] },
      { fields: ['status'] },
      { fields: ['registeredAt'] },
      { fields: ['totalScore'] },
      { fields: ['rank'] }
    ]
  });

  ChallengeRegistration.prototype.calculateProgress = function() {
    return Math.round((this.completedProjects / 30) * 100);
  };

  ChallengeRegistration.prototype.updateProgress = function() {
    this.progress = this.calculateProgress();
    return this.save();
  };

  ChallengeRegistration.prototype.isActive = function() {
    return this.status === 'active';
  };

  ChallengeRegistration.prototype.canParticipate = function() {
    return this.isActive() && this.registeredAt <= new Date();
  };

  ChallengeRegistration.prototype.getRank = async function() {
    const rank = await ChallengeRegistration.count({
      where: {
        challengeId: this.challengeId,
        totalScore: { [sequelize.Op.gt]: this.totalScore }
      }
    });
    return rank + 1;
  };

  ChallengeRegistration.associate = (models) => {
    ChallengeRegistration.belongsTo(models.Challenge, { foreignKey: 'challengeId', as: 'challenge' });
    ChallengeRegistration.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return ChallengeRegistration;
}; 