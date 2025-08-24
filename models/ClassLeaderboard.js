const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ClassLeaderboard = sequelize.define('ClassLeaderboard', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    totalScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    assignmentScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    attendanceScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    assignmentsCompleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    totalAssignments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    attendanceCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    totalSessions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    rank: {
      type: DataTypes.INTEGER
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    indexes: [
      { fields: ['classId'] },
      { fields: ['userId'] },
      { fields: ['totalScore'] },
      { fields: ['rank'] },
      { fields: ['lastUpdated'] },
      {
        unique: true,
        fields: ['classId', 'userId']
      }
    ]
  });

  ClassLeaderboard.associate = (models) => {
    ClassLeaderboard.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class'
    });
    
    ClassLeaderboard.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return ClassLeaderboard;
};
