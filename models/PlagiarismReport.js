const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlagiarismReport = sequelize.define('PlagiarismReport', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    submissionId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Submissions', key: 'id' } },
    comparedSubmissionId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Submissions', key: 'id' } },
    similarity: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    flagged: { type: DataTypes.BOOLEAN, defaultValue: false },
    details: { type: DataTypes.JSONB, defaultValue: {} },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });
  PlagiarismReport.associate = (models) => {
    PlagiarismReport.belongsTo(models.Submission, { foreignKey: 'submissionId', as: 'submission' });
    PlagiarismReport.belongsTo(models.Submission, { foreignKey: 'comparedSubmissionId', as: 'comparedSubmission' });
  };
  return PlagiarismReport;
}; 