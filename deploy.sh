#!/bin/bash

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Enable uuid extension first
echo "🔧 Enabling UUID extension..."
npx sequelize-cli db:migrate --to 20240101000000-enable-uuid-extension.js || echo "UUID extension migration failed, but continuing..."

# Run all database migrations
echo "🗄️ Running database migrations..."
npx sequelize-cli db:migrate || {
  echo "❌ Migration failed"
  exit 1
}

echo "✅ Database setup completed successfully!"

# Start the application
echo "🚀 Starting the application..."
npm start 