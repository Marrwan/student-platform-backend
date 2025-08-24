const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ClassInvitation = sequelize.define('ClassInvitation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    invitedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'class_invitations',
    timestamps: true,
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['token']
      },
      {
        fields: ['classId']
      },
      {
        fields: ['expiresAt']
      }
    ]
  });

  ClassInvitation.associate = (models) => {
    ClassInvitation.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    ClassInvitation.belongsTo(models.User, { foreignKey: 'invitedBy', as: 'inviter' });
  };

  return ClassInvitation;
};
