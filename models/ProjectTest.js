const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProjectTest = sequelize.define('ProjectTest', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Projects', key: 'id' } },
    name: { type: DataTypes.STRING, allowNull: false, validate: { len: [3, 100] } },
    description: { type: DataTypes.TEXT },
    testType: { type: DataTypes.ENUM('unit', 'integration', 'e2e', 'custom'), defaultValue: 'unit' },
    testCode: { type: DataTypes.TEXT, allowNull: false },
    expectedOutput: { type: DataTypes.TEXT },
    timeout: { type: DataTypes.INTEGER, defaultValue: 5000 }, // milliseconds
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    weight: { type: DataTypes.DECIMAL(5, 2), defaultValue: 1.0, validate: { min: 0, max: 10 } },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    metadata: { type: DataTypes.JSONB, defaultValue: {} }
  }, {
    indexes: [
      { fields: ['projectId'] },
      { fields: ['testType'] },
      { fields: ['isActive'] },
      { fields: ['order'] }
    ]
  });

  ProjectTest.prototype.runTest = function(submissionCode) {
    // This would be implemented to actually run the test
    // For now, return a mock result
    return {
      passed: Math.random() > 0.5,
      output: 'Test output',
      error: null,
      executionTime: Math.random() * 1000
    };
  };

  ProjectTest.prototype.validateTestCode = function() {
    try {
      // Basic validation - check if it's valid JavaScript
      new Function(this.testCode);
      return true;
    } catch (error) {
      return false;
    }
  };

  ProjectTest.associate = (models) => {
    ProjectTest.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
  };

  return ProjectTest;
}; 