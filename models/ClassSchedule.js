const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ClassSchedule = sequelize.define('ClassSchedule', {
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
  dayOfWeek: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('virtual', 'physical'),
    allowNull: false,
    defaultValue: 'virtual'
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  meetingLink: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
  }, {
    tableName: 'class_schedules',
    timestamps: true,
    indexes: [
      {
        fields: ['classId']
      },
      {
        fields: ['dayOfWeek']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  return ClassSchedule;
};
