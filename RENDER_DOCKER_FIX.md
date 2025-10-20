# 🚨 Why "Page Not Found" on Render (Docker Deployment)

## The Problem

You deployed Docker containers to Render successfully, but you're getting "Page not found" errors. Here's why:

### ❌ **What Went Wrong:**

1. **docker-compose doesn't work on Render** - Render deploys services separately
2. **nginx.conf has wrong backend URL** - Uses `http://backend:5000` which only works in docker-compose
3. **React Router needs server configuration** - Server doesn't know about client-side routes

---

## ✅ **The Solution: Two Options**

### **Option 1: Deploy Frontend as Static Site (RECOMMENDED)**

This is simpler and cheaper (static sites are free on Render).

#### **Steps:**

1. **Don't use Docker for frontend** on Render
2. **Deploy frontend as Static Site:**
   - Go to Render Dashboard → New → **Static Site**
   - Connect your GitHub repo
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
   - **Add Environment Variable:**
     - Key: `REACT_APP_API_URL`
     - Value: `https://your-backend.onrender.com/api`

3. **Add Rewrite Rule:**
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

4. **Deploy backend separately as Docker Web Service:**
   - New → **Web Service**
   - Environment: Docker
   - Dockerfile Path: `./Dockerfile`
   - Port: 5000
   - Add all environment variables

#### **Why this works:**
- ✅ Frontend serves static files (fast, free)
- ✅ No nginx configuration needed
- ✅ Render's CDN handles routing automatically
- ✅ Backend runs in Docker with your existing Dockerfile

---

### **Option 2: Deploy Both as Docker Web Services**

If you want both as Docker containers:

#### **Backend Deployment:**

1. **Create Web Service for Backend:**
   - New → Web Service
   - Environment: Docker
   - Dockerfile Path: `./Dockerfile`
   - Port: 5000
   - Add environment variables from `.env`

2. **Note the backend URL** (e.g., `https://medication-backend.onrender.com`)

#### **Frontend Deployment:**

1. **Use the Render-specific Dockerfile:**
   - Rename `frontend/Dockerfile.render` to use it
   - Or modify existing `frontend/Dockerfile`

2. **Update nginx config to use actual backend URL:**

**Option A: Hardcode the URL (quick fix)**

Edit `frontend/nginx.conf` line 33:
```nginx
location /api {
    proxy_pass https://medication-backend.onrender.com;  # Your actual backend URL
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

**Option B: Use environment variable (better)**

Use `frontend/Dockerfile.render` which supports `BACKEND_URL` env var:
```bash
# On Render, set environment variable:
BACKEND_URL=https://medication-backend.onrender.com
```

3. **Create Web Service for Frontend:**
   - New → Web Service
   - Root Directory: `frontend`
   - Environment: Docker
   - Dockerfile Path: `./frontend/Dockerfile.render` (or `./frontend/Dockerfile` if modified)
   - Port: 80
   - Add environment variable:
     - Key: `BACKEND_URL`
     - Value: `https://your-backend.onrender.com`

---

## 🎯 **Quick Fix for Your Current Deployment**

If you've already deployed and it's showing "Page not found":

### **Step 1: Check what you deployed**

```powershell
# Check your Render dashboard
# Did you deploy:
# A) Frontend + Backend as separate Web Services?
# B) Just the frontend?
# C) Tried to use docker-compose?
```

### **Step 2: Fix the frontend**

If you deployed frontend as **Docker Web Service**:

1. **Delete the frontend service** on Render
2. **Create a new Static Site** instead (see Option 1 above)
3. Much simpler and works perfectly!

If you must use Docker for frontend:

1. **Edit `frontend/nginx.conf`** in your GitHub repo
2. **Change line 33** from:
   ```nginx
   proxy_pass http://backend:5000;
   ```
   To:
   ```nginx
   proxy_pass https://your-actual-backend-url.onrender.com;
   ```
3. **Commit and push**
4. **Render will auto-redeploy**

### **Step 3: Update backend CORS**

Edit `server.js` to allow your frontend URL:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost',
  'https://your-frontend-name.onrender.com',  // Add your Render frontend URL
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

---

## 📋 **Recommended Setup for Render**

### **Backend (Docker Web Service):**
```
✅ Type: Web Service
✅ Environment: Docker
✅ Dockerfile: ./Dockerfile
✅ Port: 5000
✅ Branch: main
✅ Auto-deploy: Yes

Environment Variables:
- MONGO_URI
- SESSION_SECRET
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- EMAIL_USER
- EMAIL_PASS
- NODE_ENV=production
- CORS_ORIGIN=https://your-frontend.onrender.com
```

### **Frontend (Static Site):**
```
✅ Type: Static Site
✅ Root Directory: frontend
✅ Build Command: npm install && npm run build
✅ Publish Directory: build
✅ Branch: main
✅ Auto-deploy: Yes

Rewrite Rule:
- Source: /*
- Destination: /index.html
- Action: Rewrite

Environment Variables:
- REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## 🔍 **Debugging Checklist**

When you see "Page not found":

### **1. Check the URL**
- ✅ Root (`/`) works? → Backend issue or build problem
- ❌ Routes (`/login`, `/medications`) fail? → Missing rewrite rule or `_redirects`

### **2. Check Browser Console**
```
F12 → Console tab
Look for errors:
- 404 on routes? → React Router not configured
- CORS errors? → Backend CORS issue
- Network errors? → Backend not accessible
```

### **3. Check Render Logs**
```
Render Dashboard → Your Service → Logs
Look for:
- Build errors
- Start errors
- Request errors
```

### **4. Test Backend Directly**
```bash
# Replace with your backend URL
curl https://your-backend.onrender.com/api/auth/login

# Should return:
# 401 Unauthorized (good - endpoint exists)
# or
# 200 with data

# Should NOT return:
# 404 Not Found (bad - backend not working)
# Connection refused (bad - backend not running)
```

---

## 📂 **File Structure for Render**

```
your-repo/
├── Dockerfile                    # Backend Docker (for Render Web Service)
├── server.js                     # Backend entry point
├── package.json                  # Backend dependencies
├── .env.example                  # Backend env template
├── routes/
├── models/
└── frontend/
    ├── Dockerfile                # Original (for docker-compose)
    ├── Dockerfile.render         # For Render Docker deployment (optional)
    ├── nginx.conf                # Local docker-compose
    ├── nginx.render.conf         # Render Docker deployment (optional)
    ├── package.json              # Frontend dependencies
    ├── public/
    │   └── _redirects            # For Static Site deployment ✅
    └── src/
```

---

## ✅ **Action Items**

Choose your deployment strategy:

### **Strategy A: Static Site Frontend (Recommended)**

1. [ ] Deploy backend as Docker Web Service
2. [ ] Deploy frontend as Static Site
3. [ ] Set `REACT_APP_API_URL` environment variable on frontend
4. [ ] Update backend CORS to allow frontend URL
5. [ ] Test all routes

### **Strategy B: Both Docker Services**

1. [ ] Deploy backend as Docker Web Service
2. [ ] Update `frontend/nginx.conf` with backend URL
3. [ ] Commit and push changes
4. [ ] Deploy frontend as Docker Web Service
5. [ ] Set `BACKEND_URL` environment variable
6. [ ] Update backend CORS
7. [ ] Test all routes

---

## 🚀 **Expected Results**

After fixing:

```
✅ https://your-app.onrender.com          → Login page loads
✅ https://your-app.onrender.com/login    → Login page loads
✅ https://your-app.onrender.com/register → Register page loads
✅ Refresh any page                        → Page stays, no 404
✅ Login works                             → Redirects to dashboard
✅ API calls work                          → Data loads correctly
```

---

## 💡 **Pro Tips**

1. **Use Static Site for frontend** - It's faster, free, and easier
2. **Use Docker only for backend** - Better for Node.js apps with dependencies
3. **Set environment variables on Render** - Don't commit sensitive data
4. **Enable auto-deploy** - Automatic deployments on git push
5. **Check logs regularly** - Helps identify issues quickly

---

## 🆘 **Still Having Issues?**

Share these details:

1. **Render service types:**
   - Backend: Web Service (Docker/Node)?
   - Frontend: Static Site/Web Service (Docker)?

2. **URLs:**
   - Backend URL: `https://???`
   - Frontend URL: `https://???`

3. **Error details:**
   - What page shows "Page not found"?
   - Browser console errors?
   - Render logs errors?

---

**TL;DR:** 
- ✅ **Use Static Site for frontend** (easiest fix)
- ✅ **Or update nginx.conf with actual backend URL** (if using Docker)
- ✅ **The `_redirects` file is already created** for Static Site deployment
- ✅ **Push to GitHub and redeploy**

Good luck! 🎉
