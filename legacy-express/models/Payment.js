const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Payment extends Model {}
  Payment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    submissionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'NGN',
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      defaultValue: 'pending',
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    paystackResponse: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('late_fee', 'other'),
      defaultValue: 'late_fee',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments',
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Payment.belongsTo(models.Submission, {
      foreignKey: 'submissionId',
      as: 'submission'
    });
  };

  return Payment;
}; 