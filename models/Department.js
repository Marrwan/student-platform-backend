const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Department = sequelize.define('Department', {
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
        headOfDepartmentId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        location: {
            type: DataTypes.STRING,
            defaultValue: 'Headquarters'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });

    Department.associate = (models) => {
        Department.belongsTo(models.User, {
            foreignKey: 'headOfDepartmentId',
            as: 'headOfDepartment'
        });
        Department.hasMany(models.User, {
            foreignKey: 'departmentId',
            as: 'employees'
        });
    };

    return Department;
};
