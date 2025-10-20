# 🚀 Render Deployment Guide

## Issue: "Page not found" Error

If you're getting a "Page not found" error on Render, it's because React Router uses client-side routing, but the server doesn't know how to handle those routes.

---

## ✅ Quick Fix Solutions

### Solution 1: Using Static Site Deployment

If you deployed the frontend as a **Static Site** on Render:

1. **Add `_redirects` file** (Already created in `frontend/public/_redirects`):
   ```
   /* /index.html 200
   ```

2. **Rebuild your React app:**
   ```powershell
   cd frontend
   npm run build
   ```

3. **Deploy Settings on Render:**
   - **Build Command:** `npm run build`
   - **Publish Directory:** `build`

4. **Redeploy on Render** to pick up the `_redirects` file

---

### Solution 2: Using Docker Deployment

If you deployed using **Docker** on Render:

#### **Option A: Deploy Backend + Frontend Together**

Use your existing `docker-compose.yml` but Render doesn't support docker-compose directly. You need to:

1. **Deploy Backend as Web Service:**
   - Create a new **Web Service** on Render
   - **Docker Context:** Root directory (`/`)
   - **Dockerfile Path:** `./Dockerfile` (backend)
   - **Port:** 5000
   - **Environment Variables:** Add all from `.env`

2. **Deploy Frontend as Web Service:**
   - Create another **Web Service** on Render
   - **Docker Context:** `./frontend`
   - **Dockerfile Path:** `./frontend/Dockerfile`
   - **Port:** 80
   - **Environment Variable:**
     - `REACT_APP_API_URL`: Your backend URL (e.g., `https://your-backend.onrender.com`)

#### **Option B: Deploy as Separate Services**

**Backend Service:**
```yaml
# render.yaml (in root)
services:
  - type: web
    name: medication-backend
    env: docker
    dockerfilePath: ./Dockerfile
    envVars:
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false
      - key: SESSION_SECRET
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      # Add other env vars
```

**Frontend Service:**
```yaml
  - type: web
    name: medication-frontend
    env: docker
    dockerfilePath: ./frontend/Dockerfile
    envVars:
      - key: REACT_APP_API_URL
        value: https://medication-backend.onrender.com
```

---

### Solution 3: Update Frontend API Configuration

If your frontend can't connect to the backend API, update the API baseURL:

**File: `frontend/src/services/api.js`**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

Then set environment variable on Render:
- **Key:** `REACT_APP_API_URL`
- **Value:** `https://your-backend-name.onrender.com/api`

---

## 🔧 Recommended Render Setup

### **Option 1: Two Separate Services (Recommended)**

#### **Frontend (Static Site):**
1. Go to Render Dashboard
2. Click **New** → **Static Site**
3. Connect your GitHub repository
4. **Settings:**
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
   - **Add Rewrite Rule:**
     - **Source:** `/*`
     - **Destination:** `/index.html`
     - **Action:** `Rewrite`

#### **Backend (Web Service):**
1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. **Settings:**
   - **Branch:** `main`
   - **Root Directory:** `.` (root)
   - **Environment:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Port:** `5000`
   - **Environment Variables:** Add all from `.env`

---

### **Option 2: Docker Web Services**

Deploy both as Docker web services:

#### **Backend:**
```bash
# Render will use your Dockerfile
# Settings on Render:
- Environment: Docker
- Dockerfile Path: ./Dockerfile
- Port: 5000
```

#### **Frontend:**
```bash
# Render will use frontend/Dockerfile
# Settings on Render:
- Environment: Docker
- Dockerfile Path: ./frontend/Dockerfile
- Port: 80
```

**Important:** Update `frontend/nginx.conf` to proxy to your backend URL:

```nginx
location /api {
    # Change this to your actual backend URL
    proxy_pass https://your-backend-name.onrender.com;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Page not found" on Refresh
**Cause:** Server doesn't know about React routes  
**Fix:** Add `_redirects` file (Solution 1) or configure Nginx properly (Solution 2)

### Issue 2: API Calls Fail (CORS errors)
**Cause:** Backend CORS not configured for frontend domain  
**Fix:** Update `server.js`:

```javascript
// Update CORS origin
const corsOrigin = process.env.NODE_ENV === 'production'
  ? 'https://your-frontend-name.onrender.com'  // Your Render frontend URL
  : 'http://localhost:3000';

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
```

### Issue 3: Environment Variables Not Loading
**Cause:** `.env` file not being used in production  
**Fix:** Set environment variables in Render dashboard, not in `.env` file

### Issue 4: Build Fails
**Cause:** Missing dependencies or build command  
**Fix:** Ensure `package.json` has all dependencies and proper build script

---

## 📋 Pre-Deployment Checklist

### Backend:
- [ ] All environment variables added to Render
- [ ] CORS origin set to frontend URL
- [ ] MongoDB connection string correct
- [ ] Port set to 5000 (or `process.env.PORT`)
- [ ] Health check endpoint working

### Frontend:
- [ ] `_redirects` file in `public/` folder
- [ ] API URL configured correctly
- [ ] Build command works locally (`npm run build`)
- [ ] Environment variables set on Render
- [ ] CORS enabled on backend

---

## 🚀 Step-by-Step Deployment

### **Step 1: Update Backend CORS**

**File: `server.js`**
```javascript
// Add your Render frontend URL
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-app-name.onrender.com',  // Add your Render URL
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### **Step 2: Update Frontend API URL**

**Create `.env.production` in frontend:**
```env
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

### **Step 3: Deploy Backend**

1. Go to Render → New Web Service
2. Connect GitHub repo
3. **Name:** `medication-backend`
4. **Environment:** Docker (if using Dockerfile) or Node
5. **Build Command:** `npm install` (if Node)
6. **Start Command:** `node server.js` (if Node)
7. **Port:** 5000
8. Add all environment variables from `.env`
9. Click **Create Web Service**

### **Step 4: Deploy Frontend**

1. Go to Render → New Static Site
2. Connect GitHub repo
3. **Name:** `medication-frontend`
4. **Root Directory:** `frontend`
5. **Build Command:** `npm install && npm run build`
6. **Publish Directory:** `build`
7. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL from Step 3
8. **Add Rewrite Rule:**
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`
9. Click **Create Static Site**

### **Step 5: Update Backend CORS with Frontend URL**

After frontend is deployed, update backend:

1. Go to backend service on Render
2. Add environment variable:
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://medication-frontend.onrender.com`)
3. Update `server.js` to use this variable
4. Redeploy backend

### **Step 6: Test Everything**

1. Visit your frontend URL
2. Try to register/login
3. Test all features
4. Check browser console for errors
5. Verify API calls are working

---

## 🔍 Debugging on Render

### View Logs:
1. Go to your service on Render
2. Click **Logs** tab
3. Look for errors

### Common Log Errors:

**"Cannot find module":**
- Missing dependency in `package.json`
- Run `npm install` locally first

**"Port already in use":**
- Ensure using `process.env.PORT` in server.js

**"MongoDB connection failed":**
- Check `MONGODB_URI` environment variable
- Verify MongoDB Atlas allows Render's IP (use 0.0.0.0/0)

---

## 📞 Need Help?

If you're still getting "Page not found":

1. **Check which deployment method you used:**
   - Static Site? Use Solution 1 (_redirects file)
   - Docker? Use Solution 2 (Nginx config)
   - Node? Add catch-all route in Express

2. **Verify the `_redirects` file is in the build:**
   ```powershell
   cd frontend/build
   ls _redirects  # Should exist
   ```

3. **Check Render logs** for specific errors

4. **Test locally first:**
   ```powershell
   # Build and serve
   cd frontend
   npm run build
   npx serve -s build
   ```

---

## ✅ Final Verification

After deployment, test these URLs:

- ✅ `https://your-app.onrender.com` → Should load login page
- ✅ `https://your-app.onrender.com/login` → Should load login page
- ✅ `https://your-app.onrender.com/register` → Should load register page
- ✅ Refresh any page → Should NOT show 404
- ✅ Login → Should work and redirect to dashboard

---

**Good luck with your deployment! 🚀**

*If you continue to have issues, share:*
1. *How you deployed (Static Site, Docker, Node service)*
2. *The exact URL showing the error*
3. *Any error logs from Render dashboard*
