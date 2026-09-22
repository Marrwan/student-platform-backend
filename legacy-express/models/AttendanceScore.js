const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AttendanceScore = sequelize.define('AttendanceScore', {
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
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    maxScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100
    },
    attendanceDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT
    },
    awardedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    indexes: [
      { fields: ['classId'] },
      { fields: ['userId'] },
      { fields: ['awardedBy'] },
      { fields: ['attendanceDate'] },
      {
        unique: true,
        fields: ['classId', 'userId', 'attendanceDate']
      }
    ]
  });

  AttendanceScore.associate = (models) => {
    AttendanceScore.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class'
    });
    
    AttendanceScore.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    AttendanceScore.belongsTo(models.User, {
      foreignKey: 'awardedBy',
      as: 'awardedByUser'
    });
  };

  return AttendanceScore;
};
