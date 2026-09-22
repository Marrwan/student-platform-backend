const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChallengeAnnouncement = sequelize.define('ChallengeAnnouncement', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    challengeId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Challenges', key: 'id' } },
    title: { type: DataTypes.STRING, allowNull: false, validate: { len: [3, 200] } },
    content: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('info', 'warning', 'success', 'error'), defaultValue: 'info' },
    priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
    publishedAt: { type: DataTypes.DATE },
    expiresAt: { type: DataTypes.DATE },
    createdBy: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    readBy: { type: DataTypes.ARRAY(DataTypes.UUID), defaultValue: [] },
    metadata: { type: DataTypes.JSONB, defaultValue: {} }
  }, {
    indexes: [
      { fields: ['challengeId'] },
      { fields: ['isPublished'] },
      { fields: ['publishedAt'] },
      { fields: ['type'] },
      { fields: ['priority'] }
    ]
  });

  ChallengeAnnouncement.prototype.isActive = function() {
    const now = new Date();
    if (!this.isPublished) return false;
    if (this.expiresAt && now > this.expiresAt) return false;
    return true;
  };

  ChallengeAnnouncement.prototype.markAsRead = function(userId) {
    if (!this.readBy.includes(userId)) {
      this.readBy.push(userId);
      return this.save();
    }
    return Promise.resolve(this);
  };

  ChallengeAnnouncement.prototype.publish = function() {
    this.isPublished = true;
    this.publishedAt = new Date();
    return this.save();
  };

  ChallengeAnnouncement.associate = (models) => {
    ChallengeAnnouncement.belongsTo(models.Challenge, { foreignKey: 'challengeId', as: 'challenge' });
    ChallengeAnnouncement.belongsTo(models.User, { foreignKey: 'createdBy', as: 'author' });
  };

  return ChallengeAnnouncement;
}; 