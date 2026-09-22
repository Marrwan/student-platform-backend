#!/bin/bash

echo "🚀 Starting application..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
sleep 15

# Test database connection with retries
echo "🔍 Testing database connection..."
for i in {1..5}; do
    echo "  Attempt $i of 5..."
    npx sequelize-cli db:migrate:status > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "  ✅ Database connection successful"
        break
    else
        echo "  ❌ Database connection failed, retrying in 10 seconds..."
        sleep 10
    fi
done

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