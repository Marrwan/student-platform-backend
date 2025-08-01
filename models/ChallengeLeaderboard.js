const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChallengeLeaderboard = sequelize.define('ChallengeLeaderboard', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    challengeId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Challenges', key: 'id' } },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    totalScore: { type: DataTypes.INTEGER, defaultValue: 0 },
    completedProjects: { type: DataTypes.INTEGER, defaultValue: 0 },
    streakCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    averageScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    rank: { type: DataTypes.INTEGER },
    lastSubmissionAt: { type: DataTypes.DATE },
    lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    bonusPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
    penaltyPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
    finalScore: { type: DataTypes.INTEGER, defaultValue: 0 },
    metadata: { type: DataTypes.JSONB, defaultValue: {} }
  }, {
    indexes: [
      { unique: true, fields: ['challengeId', 'userId'] },
      { fields: ['challengeId', 'totalScore'] },
      { fields: ['rank'] },
      { fields: ['lastUpdated'] }
    ]
  });

  ChallengeLeaderboard.prototype.calculateFinalScore = function() {
    this.finalScore = this.totalScore + this.bonusPoints - this.penaltyPoints;
    return this.finalScore;
  };

  ChallengeLeaderboard.prototype.updateRank = async function() {
    const rank = await ChallengeLeaderboard.count({
      where: {
        challengeId: this.challengeId,
        finalScore: { [sequelize.Op.gt]: this.finalScore }
      }
    });
    this.rank = rank + 1;
    return this.save();
  };

  ChallengeLeaderboard.prototype.updateStats = function() {
    this.lastUpdated = new Date();
    this.calculateFinalScore();
    return this.save();
  };

  ChallengeLeaderboard.associate = (models) => {
    ChallengeLeaderboard.belongsTo(models.Challenge, { foreignKey: 'challengeId', as: 'challenge' });
    ChallengeLeaderboard.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return ChallengeLeaderboard;
}; 