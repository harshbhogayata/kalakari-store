# 🚀 Kalakari - Complete Setup & Deployment Guide

## ✅ Pre-requisites

- **Node.js**: v14+ (v16+ recommended)
- **npm**: v6+
- **MongoDB**: Local or MongoDB Atlas
- **Git**: For version control
- **Razorpay Account**: For payment processing
- **Email Service**: Gmail or SendGrid
- **Twilio Account** (Optional): For SMS notifications

---

## 📋 Quick Start (5 Minutes)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd Kalakari
```

### 2. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Setup Environment Variables

**Server (.env)**:
```bash
cd server
cp env.example .env
# Edit .env with your configuration
```

**Client (.env)**:
```bash
cd ../client
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000
# REACT_APP_CLIENT_URL=http://localhost:3000
```

### 4. Start Application

**Terminal 1 - Server**:
```bash
cd server
npm start
# Server will run on http://localhost:5000
```

**Terminal 2 - Client**:
```bash
cd client
npm start
# Client will run on http://localhost:3000
```

---

## 🔧 Detailed Setup Instructions

### A. Database Setup

#### Option 1: Local MongoDB
```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB service
mongod

# Create database
mongo
> use kalakari
> db.createCollection("products")
```

#### Option 2: MongoDB Atlas (Recommended for Production)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Copy connection string
4. Update `MONGODB_URI` in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kalakari?retryWrites=true&w=majority
   ```

### B. Razorpay Integration

1. **Create Account**: https://razorpay.com/
2. **Get Credentials**:
   - Go to Dashboard → Settings → API Keys
   - Copy Key ID and Key Secret
3. **Configure Webhook**:
   - Dashboard → Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payment/webhook`
   - Select events: `payment.authorized`, `payment.failed`, `order.paid`
4. **Update .env**:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   ```

### C. Email Configuration

#### Gmail (Recommended)
1. Enable 2-Step Verification in Google Account
2. Create App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select Mail and Windows Computer
   - Copy generated password
3. Update .env:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

#### SendGrid (Alternative)
1. Create account at https://sendgrid.com/
2. Create API key
3. Update .env:
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
   ```

### D. Twilio SMS (Optional)
1. Create account at https://www.twilio.com/
2. Get Account SID, Auth Token, and Phone Number
3. Update .env:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### E. AWS S3 (Optional, for image uploads)
1. Create AWS account
2. Create S3 bucket
3. Create IAM user with S3 access
4. Update .env:
   ```env
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
   AWS_S3_BUCKET=your-bucket-name
   AWS_REGION=us-east-1
   ```

---

## 📦 Seed Database with Sample Data

```bash
cd server
node seed.js
```

This will create:
- Sample products
- Admin user
- Test users
- Artisan profiles

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd ../client
npm test
```

### Manual Testing Checklist
- [ ] User Registration
- [ ] User Login
- [ ] Browse Products
- [ ] Filter Products
- [ ] Add to Cart
- [ ] Remove from Cart
- [ ] Checkout
- [ ] Payment (Razorpay)
- [ ] Order Confirmation
- [ ] Add to Wishlist
- [ ] Language Switching

---

## 🚀 Production Deployment

### 1. Environment Setup
```env
NODE_ENV=production
ENABLE_HTTPS=true
TRUST_PROXY=true
```

### 2. Build Frontend
```bash
cd client
npm run build
# Creates optimized build in client/build
```

### 3. Security Checklist
- [ ] All secrets generated and stored securely
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] Monitoring set up

### 4. Deploy

#### Option A: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create apps
heroku create kalakari-server
heroku create kalakari-client

# Set environment variables
heroku config:set -a kalakari-server NODE_ENV=production
heroku config:set -a kalakari-server MONGODB_URI=your-uri
# ... set other variables

# Deploy
git push heroku main
```

#### Option B: DigitalOcean / AWS
1. Create server instance
2. Install Node.js and MongoDB
3. Clone repository
4. Configure environment variables
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "kalakari-api"
   pm2 startup
   pm2 save
   ```
6. Setup Nginx as reverse proxy
7. Configure SSL with Let's Encrypt

#### Option C: Docker
```bash
# Build images
docker build -t kalakari-server ./server
docker build -t kalakari-client ./client

# Run containers
docker run -p 5000:5000 --env-file .env kalakari-server
docker run -p 3000:3000 kalakari-client
```

---

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check API health
curl http://localhost:5000/api/health

# Check metrics
curl http://localhost:5000/api/health/metrics
```

### Logs
```bash
# View server logs
cd server
tail -f logs/monitoring.log

# View specific error logs
grep ERROR logs/monitoring.log
```

### Database Maintenance
```bash
# Backup
mongodump --out ./backup

# Restore
mongorestore ./backup

# Cleanup old sessions (optional)
db.sessions.deleteMany({ createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) } })
```

---

## 🔍 Troubleshooting

### Database Connection Issues
```
Error: connect ECONNREFUSED
- Check MongoDB is running: mongod
- Verify MONGODB_URI in .env
- Check network connectivity
```

### Payment Integration Issues
```
Error: Razorpay keys not configured
- Verify RAZORPAY_KEY_ID in .env
- Verify RAZORPAY_KEY_SECRET in .env
- Check keys are correct (test vs live)
```

### Email Not Sending
```
Error: Gmail authentication failed
- Enable 2-Step verification in Google Account
- Generate App Password (not regular password)
- Use generated password in EMAIL_PASS
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

---

## 📚 API Documentation

API documentation is available at: `http://localhost:5000/api/docs`

### Key Endpoints

**Authentication**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

**Products**:
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `GET /api/products/search?q=keyword` - Search products

**Cart**:
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove from cart

**Payment**:
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/status/:orderId` - Check payment status

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@kalakari.shop
- WhatsApp: +91-XXXXXXXXXX

---

## 📄 License

This project is licensed under MIT License.

---

## ✨ Features Included

✅ User Registration & Authentication
✅ Product Catalog with Filters
✅ Shopping Cart (Client & Server-side)
✅ Wishlist Management
✅ Razorpay Payment Integration
✅ Order Management
✅ Admin Panel
✅ Artisan Registration
✅ Review & Rating System
✅ Multi-language Support (i18n)
✅ Email Notifications
✅ SMS Notifications (Twilio)
✅ Search & Recommendations
✅ Responsive Design
✅ Performance Optimization
✅ Security Best Practices

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
