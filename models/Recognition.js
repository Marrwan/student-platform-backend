module.exports = (sequelize, DataTypes) => {
    const Recognition = sequelize.define('Recognition', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        fromUserId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        toUserId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        category: {
            type: DataTypes.ENUM('helpful', 'innovative', 'teamwork', 'leadership'),
            defaultValue: 'helpful'
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'Recognitions',
        timestamps: true
    });

    Recognition.associate = (models) => {
        Recognition.belongsTo(models.User, { foreignKey: 'fromUserId', as: 'sender' });
        Recognition.belongsTo(models.User, { foreignKey: 'toUserId', as: 'receiver' });
    };

    return Recognition;
};
