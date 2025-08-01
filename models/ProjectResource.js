const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProjectResource = sequelize.define('ProjectResource', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Projects', key: 'id' } },
    title: { type: DataTypes.STRING, allowNull: false, validate: { len: [3, 200] } },
    description: { type: DataTypes.TEXT },
    type: { type: DataTypes.ENUM('document', 'video', 'link', 'code', 'image', 'other'), defaultValue: 'document' },
    url: { type: DataTypes.STRING },
    filePath: { type: DataTypes.STRING },
    mimeType: { type: DataTypes.STRING },
    size: { type: DataTypes.INTEGER },
    isRequired: { type: DataTypes.BOOLEAN, defaultValue: false },
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    metadata: { type: DataTypes.JSONB, defaultValue: {} }
  }, {
    indexes: [
      { fields: ['projectId'] },
      { fields: ['type'] },
      { fields: ['isRequired'] },
      { fields: ['order'] }
    ]
  });

  ProjectResource.prototype.getFileSize = function() {
    if (!this.size) return null;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (this.size === 0) return '0 Bytes';
    const i = Math.floor(Math.log(this.size) / Math.log(1024));
    return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  ProjectResource.prototype.isVideo = function() {
    return this.type === 'video' || (this.mimeType && this.mimeType.startsWith('video/'));
  };

  ProjectResource.prototype.isDocument = function() {
    return this.type === 'document' || (this.mimeType && this.mimeType.startsWith('application/'));
  };

  ProjectResource.associate = (models) => {
    ProjectResource.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
  };

  return ProjectResource;
}; 