const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Sequelize } = require('sequelize');
const dbConfig = require('./config/database.js');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

console.log(`Environment: ${env}`);
console.log('DB Config:', {
    host: config.host,
    database: config.database,
    username: config.username,
    dialect: config.dialect,
    port: config.port
});

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: console.log, // Enable logging to see SQL
    dialectOptions: config.dialectOptions
});

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful');

        const [tables] = await sequelize.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public';");
        const tableNames = tables.map(t => t.tablename);
        console.log('Tables:', tableNames);

        if (tableNames.includes('Teams') || tableNames.includes('teams')) {
            console.log('Teams table FOUND.');
            const [cols] = await sequelize.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Teams';`);
            console.log('Teams Columns:', cols.map(c => `${c.column_name}(${c.data_type})`));
        } else {
            console.log('Teams table NOT FOUND.');
        }

        if (tableNames.includes('Departments') || tableNames.includes('departments')) {
            console.log('Departments table FOUND.');
        } else {
            console.log('Departments table NOT FOUND.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

check();
