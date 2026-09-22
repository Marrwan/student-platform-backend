const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Sequelize } = require('sequelize');
const dbConfig = require('./config/database.js');
const { v4: uuidv4 } = require('uuid');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

console.log(`Environment: ${env}`);

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: console.log,
    dialectOptions: config.dialectOptions
});

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful');

        const queryInterface = sequelize.getQueryInterface();
        const now = new Date();
        const deptId = uuidv4();
        const teamId = uuidv4();

        console.log('Attempting to insert dummy Department...');
        // We need to insert department first because of FK
        try {
            await queryInterface.bulkInsert('Departments', [{
                id: deptId,
                name: 'Debug Dept ' + Math.floor(Math.random() * 1000),
                description: 'Debug',
                location: 'Debug',
                isActive: true,
                createdAt: now,
                updatedAt: now
            }]);
            console.log('Department inserted.');
        } catch (e) {
            console.error('Department insert failed:', e.message);
            // Continue to verify if Teams fails
        }

        console.log('Attempting to insert dummy Team...');
        await queryInterface.bulkInsert('Teams', [{
            id: teamId,
            name: 'Debug Team ' + Math.floor(Math.random() * 1000),
            departmentId: deptId,
            leadId: null,
            description: 'Debug',
            isActive: true,
            createdAt: now,
            updatedAt: now
        }]);
        console.log('Team inserted successfully!');

        // Cleanup
        console.log('Cleaning up...');
        await queryInterface.bulkDelete('Teams', { id: teamId });
        await queryInterface.bulkDelete('Departments', { id: deptId });

        process.exit(0);
    } catch (error) {
        console.error('Seeder Error:', error);
        process.exit(1);
    }
}

check();
