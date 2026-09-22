const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AppraisalCycle = sequelize.define('AppraisalCycle', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true // e.g., "Q3 2025"
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.ENUM('planning', 'active', 'review', 'completed', 'archived'),
            defaultValue: 'planning'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });

    AppraisalCycle.associate = (models) => {
        AppraisalCycle.hasMany(models.Appraisal, {
            foreignKey: 'cycleId',
            as: 'appraisals'
        });
    };

    return AppraisalCycle;
};
