#!/bin/bash

# Deployment script for DigitalOcean
set -e

echo "🚀 Starting deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Generate .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Generating .env file..."
    ./generate-env.sh
    echo "⚠️  Please edit .env file with your production values before continuing."
    echo "   Press Enter when ready to continue..."
    read
fi

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec backend npx sequelize-cli db:migrate

# Run database seeders
echo "🌱 Running database seeders..."
docker-compose exec backend npx sequelize-cli db:seed:all

# Check service health
echo "🏥 Checking service health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📊 API is available at: http://localhost/api"
echo "🔍 Health check: http://localhost/health" 