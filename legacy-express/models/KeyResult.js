const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const KeyResult = sequelize.define('KeyResult', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        objectiveId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Objectives',
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        targetValue: {
            type: DataTypes.STRING
        },
        selfScore: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            }
        },
        reviewerScore: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            }
        },
        employeeComments: {
            type: DataTypes.TEXT
        },
        reviewerComments: {
            type: DataTypes.TEXT
        }
    });

    KeyResult.associate = (models) => {
        KeyResult.belongsTo(models.Objective, { foreignKey: 'objectiveId', as: 'objective' });
    };

    return KeyResult;
};
