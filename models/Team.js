const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Team = sequelize.define('Team', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: [2, 100]
            }
        },
        description: {
            type: DataTypes.TEXT
        },
        departmentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Departments',
                key: 'id'
            }
        },
        leadId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        indexes: [
            { fields: ['departmentId'] },
            { fields: ['leadId'] }
        ]
    });

    Team.associate = (models) => {
        Team.belongsTo(models.Department, {
            foreignKey: 'departmentId',
            as: 'department'
        });
        Team.belongsTo(models.User, {
            foreignKey: 'leadId',
            as: 'lead'
        });
        Team.hasMany(models.User, {
            foreignKey: 'teamId',
            as: 'members'
        });
    };

    return Team;
};
