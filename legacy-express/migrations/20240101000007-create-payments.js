'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      submissionId: {
        type: Sequelize.UUID,
        references: {
          model: 'Submissions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      type: {
        type: Sequelize.ENUM('late_fee', 'penalty', 'subscription', 'other'),
        defaultValue: 'late_fee'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'NGN'
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      paystackReference: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('pending', 'successful', 'failed', 'cancelled'),
        defaultValue: 'pending'
      },
      description: {
        type: Sequelize.TEXT
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      paidAt: {
        type: Sequelize.DATE
      },
      failureReason: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('Payments', ['userId']);
    await queryInterface.addIndex('Payments', ['submissionId']);
    await queryInterface.addIndex('Payments', ['reference'], { unique: true });
    await queryInterface.addIndex('Payments', ['paystackReference']);
    await queryInterface.addIndex('Payments', ['status']);
    await queryInterface.addIndex('Payments', ['type']);
    await queryInterface.addIndex('Payments', ['paidAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Payments');
  }
}; 