const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubmissionFile = sequelize.define('SubmissionFile', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    submissionId: { type: DataTypes.UUID, allowNull: false, references: { model: 'AssignmentSubmissions', key: 'id' } },
    filename: { type: DataTypes.STRING, allowNull: false },
    originalName: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING, allowNull: false },
    size: { type: DataTypes.INTEGER, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false },
    url: { type: DataTypes.STRING },
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
    uploadedBy: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    metadata: { type: DataTypes.JSONB, defaultValue: {} }
  }, {
    indexes: [
      { fields: ['submissionId'] },
      { fields: ['uploadedBy'] },
      { fields: ['mimeType'] },
      { fields: ['uploadedAt'] }
    ]
  });

  SubmissionFile.prototype.getFileSize = function() {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (this.size === 0) return '0 Bytes';
    const i = Math.floor(Math.log(this.size) / Math.log(1024));
    return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  SubmissionFile.prototype.isImage = function() {
    return this.mimeType.startsWith('image/');
  };

  SubmissionFile.prototype.isDocument = function() {
    return this.mimeType.startsWith('application/') && 
           (this.mimeType.includes('pdf') || 
            this.mimeType.includes('word') || 
            this.mimeType.includes('excel') || 
            this.mimeType.includes('powerpoint'));
  };

  SubmissionFile.prototype.canDownload = function(userId, userRole) {
    if (this.isPublic) return true;
    return this.uploadedBy === userId || userRole === 'admin' || userRole === 'instructor';
  };

  SubmissionFile.associate = (models) => {
    SubmissionFile.belongsTo(models.AssignmentSubmission, { foreignKey: 'submissionId', as: 'submission' });
    SubmissionFile.belongsTo(models.User, { foreignKey: 'uploadedBy', as: 'uploader' });
  };

  return SubmissionFile;
}; 