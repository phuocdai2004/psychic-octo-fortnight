# 🚀 Docker Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Environment Setup
- [ ] `.env` file exists in root directory
- [ ] All required environment variables are set:
  - [ ] `MONGO_URI` (MongoDB Atlas connection string)
  - [ ] `SESSION_SECRET` (generate with crypto)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `EMAIL_USER`
  - [ ] `EMAIL_PASS`
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0` (or Docker host IP)
- [ ] Cloudinary account is active
- [ ] Gmail app password is generated

### 2. Docker Prerequisites
- [ ] Docker Desktop is installed
- [ ] Docker service is running (`docker ps` works)
- [ ] Docker Compose is available (`docker-compose --version`)
- [ ] Ports 80 and 5000 are available
  ```powershell
  netstat -ano | findstr :80
  netstat -ano | findstr :5000
  ```

### 3. Code Verification
- [ ] All backend code is in place
- [ ] Frontend build files are ready
- [ ] No syntax errors (`npm run build` succeeds)
- [ ] `.dockerignore` files are present

---

## 🏗️ Build Process

### Step 1: Build Images
```powershell
cd d:\devops
docker-compose build
```

**Expected output:**
```
✅ Successfully built backend image
✅ Successfully built frontend image
```

**Check for:**
- [ ] No build errors
- [ ] Both services built successfully
- [ ] Total build time: ~5-10 minutes (first time)

### Step 2: Start Services
```powershell
docker-compose up -d
```

**Expected output:**
```
✅ Creating network "devops_app-network"
✅ Creating medication-backend
✅ Creating medication-frontend
```

**Verify:**
- [ ] Both containers are running
  ```powershell
  docker-compose ps
  ```
- [ ] Backend shows "Up" status
- [ ] Frontend shows "Up" status

---

## 🧪 Testing

### 1. Backend Health Check
```powershell
# Should return 401 (means API is working)
curl http://localhost:5000/api/me
```

**Expected:**
- [ ] Returns JSON with status 401
- [ ] No connection errors

### 2. Frontend Access
Open browser: http://localhost

**Check:**
- [ ] Login page loads
- [ ] No console errors (F12 → Console)
- [ ] React app renders correctly
- [ ] Material-UI styling appears

### 3. Container Logs
```powershell
docker-compose logs backend
```

**Backend logs should show:**
- [ ] "Server is running on port 5000"
- [ ] "MongoDB connected successfully"
- [ ] No error messages

```powershell
docker-compose logs frontend
```

**Frontend logs should show:**
- [ ] Nginx started successfully
- [ ] No error messages

### 4. End-to-End Test

#### A. Registration
- [ ] Navigate to http://localhost
- [ ] Click "Register"
- [ ] Fill in form:
  - Username: `testuser`
  - Email: `test@example.com`
  - Password: `Test123!`
- [ ] Click "Register" button
- [ ] Redirects to dashboard
- [ ] No errors in console

#### B. Login
- [ ] Logout
- [ ] Click "Login"
- [ ] Enter credentials
- [ ] Successfully logs in
- [ ] Sees dashboard

#### C. Medications
- [ ] Navigate to "Medications"
- [ ] Can view medications list
- [ ] Create a new medication (if Doctor+)
- [ ] Edit medication
- [ ] Delete medication

#### D. Profile
- [ ] Navigate to "Profile"
- [ ] Can view profile details
- [ ] Update profile information
- [ ] Upload avatar image
- [ ] Avatar appears in AppBar

#### E. Admin (if applicable)
- [ ] Navigate to "Admin"
- [ ] See dashboard statistics
- [ ] View user management table
- [ ] Change user role
- [ ] Activate/deactivate user

---

## 📊 Monitoring

### Container Stats
```powershell
docker stats
```

**Expected resource usage:**
- Backend: ~50MB RAM, ~2% CPU
- Frontend: ~10MB RAM, ~1% CPU

### Live Logs
```powershell
docker-compose logs -f
```

**Watch for:**
- [ ] No repeated error messages
- [ ] API requests logging (if enabled)
- [ ] No memory leaks
- [ ] No connection timeouts

### Health Checks
```powershell
docker inspect medication-backend | Select-String -Pattern "Health"
docker inspect medication-frontend | Select-String -Pattern "Health"
```

**Should show:**
- [ ] Health status: "healthy"
- [ ] No failed health checks

---

## 🐛 Troubleshooting

### Container won't start

**Check logs:**
```powershell
docker-compose logs backend
docker-compose logs frontend
```

**Common issues:**
- [ ] MongoDB connection failed → Check MONGO_URI
- [ ] Port already in use → Kill process or change port
- [ ] Missing .env → Copy from .env.example
- [ ] Build failed → Check Dockerfile syntax

### API calls fail (404)

**Verify:**
- [ ] Backend is running: `docker ps`
- [ ] Backend logs show no errors
- [ ] Nginx proxy is configured correctly
- [ ] Network is created: `docker network ls`

**Test backend directly:**
```powershell
curl http://localhost:5000/api/me
```

### Frontend shows blank page

**Check:**
- [ ] Browser console for errors (F12)
- [ ] Frontend container logs
- [ ] Build completed successfully
- [ ] Nginx serving files correctly

**Test nginx:**
```powershell
docker exec medication-frontend cat /etc/nginx/conf.d/default.conf
```

### MongoDB connection fails

**Verify:**
- [ ] MONGO_URI is correct in .env
- [ ] MongoDB Atlas cluster is running
- [ ] IP whitelist includes `0.0.0.0/0`
- [ ] Username/password are correct
- [ ] Network allows outbound connections

**Test connection:**
```powershell
docker exec medication-backend node -e "require('./config/database')()"
```

---

## 🔄 Restart Process

### Restart single service
```powershell
docker-compose restart backend
# or
docker-compose restart frontend
```

### Rebuild after code changes
```powershell
# Backend changes
docker-compose build backend
docker-compose up -d backend

# Frontend changes
docker-compose build frontend
docker-compose up -d frontend
```

### Full restart
```powershell
docker-compose down
docker-compose up --build -d
```

---

## 🧹 Cleanup

### Stop containers
```powershell
docker-compose down
```

### Remove everything (including volumes)
```powershell
docker-compose down -v
```

### Clean Docker system
```powershell
# Remove unused containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Remove everything unused
docker system prune -a --volumes -f
```

---

## ✅ Production Readiness

Before deploying to production:

### Security
- [ ] Change SESSION_SECRET to strong random value
- [ ] Update CORS_ORIGIN to production domain
- [ ] Enable HTTPS (use Let's Encrypt)
- [ ] Set secure cookie flags
- [ ] Add rate limiting
- [ ] Implement CSP headers
- [ ] Scan images for vulnerabilities

### Performance
- [ ] Enable gzip compression (already in nginx)
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Monitor resource usage
- [ ] Set up log rotation

### Reliability
- [ ] Set up health checks (already configured)
- [ ] Configure auto-restart policies
- [ ] Implement backup strategy for MongoDB
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation
- [ ] Test disaster recovery

### Scalability
- [ ] Consider using Docker Swarm or Kubernetes
- [ ] Set up load balancer
- [ ] Implement horizontal scaling
- [ ] Use managed database (MongoDB Atlas ✅)
- [ ] Configure auto-scaling policies

---

## 📝 Post-Deployment

### Verify deployment
- [ ] All services are running
- [ ] Application is accessible
- [ ] All features work correctly
- [ ] No errors in logs
- [ ] Performance is acceptable

### Document deployment
- [ ] Record deployment date/time
- [ ] Note any issues encountered
- [ ] Document configuration changes
- [ ] Update version numbers
- [ ] Create deployment tag in Git

### Set up monitoring
- [ ] Configure alerts for downtime
- [ ] Monitor error rates
- [ ] Track resource usage
- [ ] Set up log analysis
- [ ] Create dashboard for metrics

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ Both containers start without errors
✅ Frontend loads at http://localhost
✅ Backend responds at http://localhost:5000
✅ User can register and login
✅ All CRUD operations work
✅ File uploads work (avatars)
✅ Email OTP works
✅ Admin features work (if admin user)
✅ No errors in container logs
✅ Resource usage is normal

---

## 📞 Support

If you encounter issues:

1. **Check logs first:**
   ```powershell
   docker-compose logs -f
   ```

2. **Review troubleshooting section above**

3. **Check documentation:**
   - DOCKER_GUIDE.md
   - REACT_SETUP.md
   - README.md

4. **Common commands:**
   ```powershell
   # Status
   docker-compose ps
   
   # Logs
   docker-compose logs backend
   docker-compose logs frontend
   
   # Restart
   docker-compose restart
   
   # Rebuild
   docker-compose up --build -d
   
   # Clean start
   docker-compose down
   docker system prune -a
   docker-compose up --build
   ```

---

**Ready to deploy! 🚀**
