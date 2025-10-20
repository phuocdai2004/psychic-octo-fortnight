# Docker Deployment Guide

## 🐳 Docker Setup Complete!

This application uses Docker Compose to run both frontend and backend services.

---

## 📦 Architecture

```
┌─────────────────────────────────────────────┐
│                                             │
│  User Browser → http://localhost           │
│                                             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Frontend Container (Nginx)                 │
│  - Serves React build                       │
│  - Port: 80                                 │
│  - Proxies /api → Backend                   │
└────────────────┬────────────────────────────┘
                 │ /api requests
                 ▼
┌─────────────────────────────────────────────┐
│  Backend Container (Node.js)                │
│  - Express API server                       │
│  - Port: 5000                               │
│  - Connects to MongoDB Atlas                │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. **Make sure .env file exists in root directory**
```bash
# d:\devops\.env should contain:
MONGO_URI=mongodb+srv://...
SESSION_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
```

### 2. **Build and run with Docker Compose**
```powershell
# In d:\devops directory
docker-compose up --build
```

### 3. **Access the application**
- **Frontend:** http://localhost
- **Backend API:** http://localhost:5000/api/me

---

## 🔧 Docker Commands

### **Start services (detached mode)**
```powershell
docker-compose up -d
```

### **Stop services**
```powershell
docker-compose down
```

### **View logs**
```powershell
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### **Rebuild containers**
```powershell
# Rebuild and restart
docker-compose up --build -d

# Rebuild specific service
docker-compose build backend
docker-compose build frontend
```

### **Check service status**
```powershell
docker-compose ps
```

### **Restart services**
```powershell
docker-compose restart
```

### **Remove everything (containers, networks, volumes)**
```powershell
docker-compose down -v
```

---

## 📂 Files Created

```
d:\devops\
├── Dockerfile                    # Backend Docker image
├── .dockerignore                 # Backend Docker ignore
├── docker-compose.yml            # Orchestration config
├── frontend\
│   ├── Dockerfile                # Frontend Docker image (multi-stage)
│   ├── nginx.conf                # Nginx configuration
│   └── .dockerignore             # Frontend Docker ignore
```

---

## 🏗️ Build Process

### **Backend Container:**
1. Uses Node.js 18 Alpine (lightweight)
2. Installs production dependencies only
3. Copies backend source files
4. Exposes port 5000
5. Runs `node server.js`

### **Frontend Container:**
1. **Stage 1 (Builder):**
   - Installs all dependencies
   - Builds React app (`npm run build`)
   - Creates optimized production bundle

2. **Stage 2 (Runtime):**
   - Uses Nginx Alpine (very lightweight)
   - Copies built files from Stage 1
   - Serves static files on port 80
   - Proxies `/api` requests to backend

---

## 🌐 Port Mapping

| Service | Container Port | Host Port | URL |
|---------|---------------|-----------|-----|
| Frontend | 80 | 80 | http://localhost |
| Backend | 5000 | 5000 | http://localhost:5000 |

---

## 🔒 Environment Variables

The `.env` file is automatically loaded by docker-compose. Required variables:

```env
MONGO_URI=mongodb+srv://...         # MongoDB connection string
SESSION_SECRET=...                   # Session encryption key
CLOUDINARY_CLOUD_NAME=...           # Cloudinary config
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=...                       # Email service
EMAIL_PASS=...
```

---

## 🧪 Testing the Deployment

### **1. Check containers are running:**
```powershell
docker-compose ps
```
Expected output:
```
NAME                    STATUS    PORTS
medication-backend      Up        0.0.0.0:5000->5000/tcp
medication-frontend     Up        0.0.0.0:80->80/tcp
```

### **2. Test backend health:**
```powershell
curl http://localhost:5000/api/me
# Should return 401 (not authenticated) - means API is working
```

### **3. Test frontend:**
Open browser: http://localhost
- Should see React app login page
- No console errors
- Can register/login

### **4. Check logs:**
```powershell
docker-compose logs -f
```
Look for:
- ✅ "MongoDB connected successfully"
- ✅ "Server is running on port 5000"
- ✅ No nginx errors

---

## 🐛 Troubleshooting

### **Container won't start:**
```powershell
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### **Port already in use:**
```powershell
# Find process using port 80 or 5000
netstat -ano | findstr :80
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
ports:
  - "8080:80"   # Frontend on port 8080 instead
```

### **MongoDB connection fails:**
- Check `MONGO_URI` in `.env`
- Verify MongoDB Atlas IP whitelist allows Docker host
- Check network connectivity

### **API calls fail (404):**
- Check nginx.conf proxy settings
- Verify backend is running: `docker-compose logs backend`
- Check network: `docker network ls`

### **Cannot access from other devices:**
```powershell
# Change docker-compose.yml to bind to 0.0.0.0
ports:
  - "0.0.0.0:80:80"
  - "0.0.0.0:5000:5000"
```

---

## 📊 Resource Usage

Expected resource consumption:

| Container | CPU | Memory | Size |
|-----------|-----|--------|------|
| Backend | ~2% | ~50MB | ~150MB |
| Frontend | ~1% | ~10MB | ~50MB |

Total: **~200MB** disk space, **~60MB** RAM

---

## 🚀 Production Deployment

### **For Production, consider:**

1. **Use Docker secrets for sensitive data:**
```yaml
secrets:
  mongo_uri:
    external: true
```

2. **Add resource limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
```

3. **Use production-grade MongoDB:**
   - MongoDB Atlas (already using ✅)
   - Or deploy MongoDB container

4. **Add HTTPS with Let's Encrypt:**
   - Use Certbot container
   - Or reverse proxy (Traefik/Nginx Proxy Manager)

5. **Add monitoring:**
   - Docker stats
   - Prometheus + Grafana
   - Application insights

6. **Set up CI/CD:**
   - GitHub Actions
   - Azure DevOps
   - Jenkins

---

## 🎯 Next Steps

- [ ] Test registration and login
- [ ] Verify all CRUD operations work
- [ ] Check file uploads (Cloudinary)
- [ ] Test admin panel
- [ ] Monitor logs for errors
- [ ] Set up backups (MongoDB exports)
- [ ] Configure domain name (optional)
- [ ] Set up HTTPS (optional)

---

## ✅ Benefits of This Setup

✅ **Portable** - Runs anywhere Docker is installed
✅ **Isolated** - Each service in its own container
✅ **Scalable** - Easy to scale with Docker Swarm/Kubernetes
✅ **Reproducible** - Same environment everywhere
✅ **Fast** - Nginx serves static files efficiently
✅ **Small** - Alpine images = minimal size
✅ **Secure** - Multi-stage builds don't include build tools

---

## 📚 Useful Commands Reference

```powershell
# Start
docker-compose up -d

# Stop
docker-compose down

# Rebuild
docker-compose up --build -d

# Logs
docker-compose logs -f

# Shell into container
docker exec -it medication-backend sh
docker exec -it medication-frontend sh

# Restart single service
docker-compose restart backend

# Remove all unused containers/images
docker system prune -a
```

---

**Your app is now Dockerized and production-ready! 🎉**
