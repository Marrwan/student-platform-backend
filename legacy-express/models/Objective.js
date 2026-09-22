const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Objective = sequelize.define('Objective', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        appraisalId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Appraisals',
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
        weight: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // Percentage weight
            validate: {
                min: 0,
                max: 100
            }
        },
        score: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0
        }
    });

    Objective.associate = (models) => {
        Objective.belongsTo(models.Appraisal, { foreignKey: 'appraisalId', as: 'appraisal' });
        Objective.hasMany(models.KeyResult, { foreignKey: 'objectiveId', as: 'keyResults' });
    };

    return Objective;
};
