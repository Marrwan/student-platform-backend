module.exports = (sequelize, DataTypes) => {
    const InternOfTheMonth = sequelize.define('InternOfTheMonth', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        month: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        nominatedBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }, {
        tableName: 'InternsOfTheMonth',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['month', 'year']
            }
        ]
    });

    InternOfTheMonth.associate = (models) => {
        InternOfTheMonth.belongsTo(models.User, { foreignKey: 'userId', as: 'winner' });
        InternOfTheMonth.belongsTo(models.User, { foreignKey: 'nominatedBy', as: 'nominator' });
    };

    return InternOfTheMonth;
};
