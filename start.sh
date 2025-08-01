#!/bin/bash

echo "🚀 Starting application..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
sleep 10

# Test database connection
echo "🔍 Testing database connection..."
npx sequelize-cli db:migrate:status > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Database connection failed, retrying in 5 seconds..."
    sleep 5
    npx sequelize-cli db:migrate:status > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "❌ Database connection still failed, but continuing..."
    fi
fi

# Run migrations
echo "🗄️ Running database migrations..."
npx sequelize-cli db:migrate

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migration failed, but continuing..."
fi

# Start the application
echo "🚀 Starting Node.js application..."
npm start 