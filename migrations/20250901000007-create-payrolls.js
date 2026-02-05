'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Payrolls', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
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
            month: {
                type: Sequelize.STRING,
                allowNull: false
            },
            year: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            paymentDate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            // Earnings
            basicSalary: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            housing: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            transport: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            clothing: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            utility: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            lunch: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            education: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            fieldStipend: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            bonus: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            allowances: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            // Deductions
            tax: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            pensionEmployee: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            nationalHousingFund: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            healthInsurance: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            loanRepayment: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            otherDeductions: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            // Totals
            grossPay: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            totalDeductions: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            netPay: {
                type: Sequelize.DECIMAL(15, 2),
                defaultValue: 0
            },
            status: {
                type: Sequelize.ENUM('processing', 'paid', 'failed'),
                defaultValue: 'processing'
            },
            isPublished: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
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
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Payrolls');
    }
};
