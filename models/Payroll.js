const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Payroll = sequelize.define('Payroll', {
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
            type: DataTypes.STRING, // e.g., "October"
            allowNull: false
        },
        year: {
            type: DataTypes.INTEGER, // e.g., 2025
            allowNull: false
        },
        paymentDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        // Earnings
        basicSalary: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        housing: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        transport: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        clothing: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        utility: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        lunch: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        education: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        fieldStipend: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        bonus: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        allowances: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        // Deductions
        tax: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        pensionEmployee: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        nationalHousingFund: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        healthInsurance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        loanRepayment: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        otherDeductions: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        // Totals
        grossPay: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        totalDeductions: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        netPay: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('processing', 'paid', 'failed'),
            defaultValue: 'processing'
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false // If false, user cannot see it yet
        }
    });

    Payroll.associate = (models) => {
        Payroll.belongsTo(models.User, { foreignKey: 'userId', as: 'employee' });
    };

    return Payroll;
};
