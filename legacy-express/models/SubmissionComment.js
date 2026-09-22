const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubmissionComment = sequelize.define('SubmissionComment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    submissionId: { type: DataTypes.UUID, allowNull: false, references: { model: 'AssignmentSubmissions', key: 'id' } },
    authorId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    content: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('feedback', 'question', 'reply', 'system'), defaultValue: 'feedback' },
    isPrivate: { type: DataTypes.BOOLEAN, defaultValue: false },
    isResolved: { type: DataTypes.BOOLEAN, defaultValue: false },
    parentId: { type: DataTypes.UUID, references: { model: 'SubmissionComments', key: 'id' } },
    metadata: { type: DataTypes.JSONB, defaultValue: {} }
  }, {
    indexes: [
      { fields: ['submissionId'] },
      { fields: ['authorId'] },
      { fields: ['type'] },
      { fields: ['isPrivate'] },
      { fields: ['parentId'] }
    ]
  });

  SubmissionComment.prototype.isReply = function() {
    return this.parentId !== null;
  };

  SubmissionComment.prototype.canEdit = function(userId) {
    return this.authorId === userId;
  };

  SubmissionComment.prototype.canDelete = function(userId, userRole) {
    return this.authorId === userId || userRole === 'admin' || userRole === 'instructor';
  };

  SubmissionComment.associate = (models) => {
    SubmissionComment.belongsTo(models.AssignmentSubmission, { foreignKey: 'submissionId', as: 'submission' });
    SubmissionComment.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
    SubmissionComment.belongsTo(models.SubmissionComment, { foreignKey: 'parentId', as: 'parent' });
    SubmissionComment.hasMany(models.SubmissionComment, { foreignKey: 'parentId', as: 'replies' });
  };

  return SubmissionComment;
}; 