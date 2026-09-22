#!/bin/bash

# DigitalOcean Droplet Setup Script
# Run this on a fresh Ubuntu 22.04 droplet

set -e

echo "🚀 Setting up DigitalOcean Droplet..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install additional tools
echo "🛠️ Installing additional tools..."
sudo apt install -y curl wget git htop

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/js-challenge
cd /opt/js-challenge

# Create uploads directory
mkdir -p uploads

# Set proper permissions
sudo chown -R $USER:$USER /opt/js-challenge

echo "✅ Droplet setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your application files to /opt/js-challenge"
echo "2. Copy env.production.example to .env and configure it"
echo "3. Run: ./deploy.sh"
echo ""
echo "🔗 Your droplet is ready for deployment!" 