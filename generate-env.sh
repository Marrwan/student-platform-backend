#!/bin/bash

# Generate .env file script
echo "🔧 Generating .env file..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Do you want to overwrite it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Aborted. .env file not overwritten."
        exit 1
    fi
fi

# Generate a random JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Copy from example and replace placeholders
cp env.production.example .env

# Replace JWT_SECRET with generated value
sed -i.bak "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/g" .env

# Remove backup file
rm .env.bak

echo "✅ .env file generated successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file with your specific values:"
echo "   - DB_PASSWORD: Set a strong database password"
echo "   - EMAIL_USER & EMAIL_PASS: Your Gmail credentials"
echo "   - CORS_ORIGIN & FRONTEND_URL: Your domain URLs"
echo "   - PAYSTACK_*: Your Paystack keys (if using payments)"
echo ""
echo "2. Run deployment:"
echo "   ./deploy.sh"
echo ""
echo "🔒 Security note: JWT_SECRET has been automatically generated." 