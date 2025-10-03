# 🚀 Kalakari Store Deployment Guide

## 📋 **Quick Setup Steps:**

### **Step 1: Prepare Frontend for Vercel**

```bash
# In your client folder
cd client
npm run build
```

### **Step 2: Frontend Deployment (Vercel)**

1. **Go to**: https://vercel.com
2. **Sign up** with GitHub
3. **Connect repository**: Import your Kalakari repo
4. **Settings**:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Environment Variables:
     ```
     REACT_APP_API_URL=https://your-backend-url.vercel.app
     ```

### **Step 3: Backend Deployment (Railway)**

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → Deploy from GitHub
4. **Select**: `server` folder only
5. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-atlas-url
   EMAIL_USER=noreply@kalakari-shop.tech
   EMAIL_PASS=your-titan-password
   ADMIN_EMAIL=Admin@kalakari-shop.tech
   ADMIN_EMAIL_PASS=your-admin-password
   ```

### **Step 4: Domain Setup**

1. **Titan Domain Panel**: Point `kalakari-shop.tech` → Vercel IP
2. **Vercel**: Add custom domain `kalakari-shop.tech`
3. **Railway**: Add custom domain `api.kalakari-shop.tech`

## 📁 **Update Configuration:**

Your environment files need updating for production:

### **Frontend API Config:**
```javascript
// client/src/utils/api.ts
const API_URL = process.env.REACT_APP_API_URL || 'https://kalakari-shop-backend.railway.app';
```

### **Server CORS Config:**
```javascript
// server/middleware/security.js
CORS_ORIGIN=https://kalakari-shop.tech
```

## ✅ **What You Get:**

- 🌐 **Frontend**: https://kalakari-shop.tech
- 🔧 **Backend**: https://api.kalakari-shop.tech  
- 📧 **Email**: Working with Titan
- 📸 **Uploads**: Railway file system
- 🔒 **SSL**: Automatic certificates

## 🎯 **Next Steps:**

1. Deploy to Vercel
2. Deploy to Railway  
3. Update environment variables
4. Point domain to services
5. Test everything!

**Ready to start deployment?** 🚀
