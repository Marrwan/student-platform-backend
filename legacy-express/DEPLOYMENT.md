# 🚀 DigitalOcean Deployment Guide

This guide will help you deploy the JavaScript Challenge backend to a DigitalOcean droplet using Docker containers.

## 📋 Prerequisites

- A DigitalOcean account
- A domain name (optional, but recommended)
- Basic knowledge of SSH and command line

## 🎯 Quick Deployment

### Step 1: Create a DigitalOcean Droplet

1. Log into your DigitalOcean account
2. Click "Create" → "Droplets"
3. Choose:
   - **Image**: Ubuntu 22.04 (LTS) x64
   - **Size**: Basic → Regular → $6/month (1GB RAM, 1 vCPU)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH key (recommended) or Password
4. Click "Create Droplet"

### Step 2: Connect to Your Droplet

```bash
ssh root@your-droplet-ip
```

### Step 3: Run the Setup Script

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-repo/main/setup-droplet.sh | bash

# Logout and login again to apply Docker group changes
exit
ssh root@your-droplet-ip
```

### Step 4: Upload Your Application

```bash
# Navigate to the application directory
cd /opt/js-challenge

# Clone your repository or upload files
git clone https://github.com/your-username/students_challenge.git .

# Navigate to backend directory (where Docker files are located)
cd backend
```

### Step 5: Configure Environment Variables

```bash
# Copy the example environment file
cp env.production.example .env

# Edit the environment file
nano .env
```

**Important variables to configure:**
- `DB_PASSWORD`: Set a strong database password
- `JWT_SECRET`: Generate a random secret key
- `EMAIL_USER` & `EMAIL_PASS`: Your Gmail credentials
- `CORS_ORIGIN`: Your domain (if you have one)
- `FRONTEND_URL`: Your frontend URL
- `PAYSTACK_SECRET_KEY` & `PAYSTACK_PUBLIC_KEY`: If using Paystack payments

### Step 6: Deploy

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

## 🔧 Configuration

### Environment Variables

Edit `.env` file with your production values:

```bash
# Database
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-random-secret-key

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Domain (if you have one)
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Paystack (if using payments)
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
```

### Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password for "Mail"
4. Use this password in `EMAIL_PASS`

## 🌐 Domain Setup (Optional)

### Step 1: Point Domain to Droplet

1. Go to your domain registrar
2. Add an A record pointing to your droplet's IP
3. Wait for DNS propagation (up to 24 hours)

### Step 2: Configure Nginx

Edit `nginx/nginx.conf` and replace `localhost` with your domain:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

### Step 3: SSL Certificate (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📊 Monitoring

### Check Service Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f backend
```

### Health Check

```bash
# Check if the API is responding
curl http://your-droplet-ip/health

# Check API endpoints
curl http://your-droplet-ip/api/health
```

## 🔄 Updates

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build

# Run migrations if needed
docker-compose exec backend npx sequelize-cli db:migrate
```

### Update Database

```bash
# Run migrations
docker-compose exec backend npx sequelize-cli db:migrate

# Run seeders (if needed)
docker-compose exec backend npx sequelize-cli db:seed:all
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop apache2  # if Apache is running
   ```

2. **Database connection failed**
   ```bash
   docker-compose logs postgres
   docker-compose restart postgres
   ```

3. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER /opt/js-challenge
   ```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f backend
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

## 🔒 Security

### Firewall Setup

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d
```

## 📈 Scaling

### Increase Resources

1. Power off your droplet
2. Resize to a larger plan
3. Power on and restart services

### Load Balancing

For high traffic, consider:
- Using DigitalOcean Load Balancer
- Setting up multiple droplets
- Using a CDN for static assets

## 💰 Cost Optimization

- **Basic Plan**: $6/month for development/testing
- **Standard Plan**: $12/month for production
- **Premium Plan**: $18/month for high traffic

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Check firewall settings
4. Ensure ports are open

## 📝 API Documentation

Once deployed, your API will be available at:
- **Base URL**: `http://your-droplet-ip/api`
- **Health Check**: `http://your-droplet-ip/health`
- **Admin Login**: `POST /api/auth/login`

**Default Admin Credentials:**
- Email: `admin@javascriptchallenge.com`
- Password: `password123`

**⚠️ Remember to change the default password in production!** 