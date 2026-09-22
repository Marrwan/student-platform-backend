const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Sequelize } = require('sequelize');
const dbConfig = require('./config/database.js');

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

const seeder = require('./seeders/20260212090500-demo-hrms-data.js');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful');
        const queryInterface = sequelize.getQueryInterface();

        console.log('Running seeder DOWN (cleanup)...');
        try {
            await seeder.down(queryInterface, Sequelize);
        } catch (e) {
            console.warn('Down failed (might be first run):', e.message);
        }

        console.log('Running seeder UP...');
        await seeder.up(queryInterface, Sequelize);

        console.log('Seeder completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeder Error:', error);
        process.exit(1);
    }
}

run();
