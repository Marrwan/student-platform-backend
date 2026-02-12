const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ActionItem = sequelize.define('ActionItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        standupId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Standups',
                key: 'id'
            }
        },
        assignedTo: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
            defaultValue: 'pending'
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }, {
        tableName: 'ActionItems',
        timestamps: true
    });

    ActionItem.associate = (models) => {
        ActionItem.belongsTo(models.Standup, {
            foreignKey: 'standupId',
            as: 'standup'
        });
        ActionItem.belongsTo(models.User, {
            foreignKey: 'assignedTo',
            as: 'assignee'
        });
        ActionItem.belongsTo(models.User, {
            foreignKey: 'createdBy',
            as: 'creator'
        });
    };

    return ActionItem;
};
