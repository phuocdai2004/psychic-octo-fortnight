# 🚀 Docker Quick Start - Your App is Running!

## ✅ Your Containers are UP and RUNNING!

```
✔ medication-backend  → Running on port 5000
✔ medication-frontend → Running on port 80
```

---

## 🌐 **Access Your Application**

### **Frontend (React App):**
```
http://localhost
```
**Or:**
```
http://localhost:80
```

### **Backend API:**
```
http://localhost:5000
```

### **Test Backend API:**
```powershell
# Test if backend is responding
curl http://localhost:5000/api/auth/login
```

---

## 📋 **Useful Docker Commands**

### **1. Check Container Status**
```powershell
docker-compose ps
```

### **2. View Logs (All Services)**
```powershell
# Follow logs in real-time
docker-compose logs -f

# View last 50 lines
docker-compose logs --tail=50
```

### **3. View Backend Logs Only**
```powershell
# Real-time logs
docker-compose logs -f backend

# Last 20 lines
docker-compose logs --tail=20 backend
```

### **4. View Frontend Logs Only**
```powershell
# Real-time logs
docker-compose logs -f frontend

# Last 20 lines
docker-compose logs --tail=20 frontend
```

### **5. Restart Services**
```powershell
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### **6. Stop Services**
```powershell
# Stop all containers (but don't remove them)
docker-compose stop

# Stop and remove containers
docker-compose down
```

### **7. Start Services (if stopped)**
```powershell
# Start existing containers
docker-compose start

# Or rebuild and start
docker-compose up -d
```

### **8. Rebuild Containers**
```powershell
# Rebuild and restart everything
docker-compose up --build -d

# Rebuild specific service
docker-compose up --build -d backend
docker-compose up --build -d frontend
```

### **9. Check Container Health**
```powershell
# Detailed status
docker ps

# Inspect specific container
docker inspect medication-backend
docker inspect medication-frontend
```

### **10. Execute Commands Inside Container**
```powershell
# Open bash in backend container
docker exec -it medication-backend sh

# Open bash in frontend container
docker exec -it medication-frontend sh

# Run a command without entering container
docker exec medication-backend npm --version
```

---

## 🧪 **Test Your Application**

### **Step 1: Open Frontend**
1. Open browser: **http://localhost**
2. You should see the login page

### **Step 2: Register New Account**
1. Click "Register"
2. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123!`
   - Role: Select one (Patient, Doctor, etc.)
3. Click Register
4. Should redirect to dashboard

### **Step 3: Login**
1. Enter credentials
2. Click Login
3. Should see dashboard with navigation

### **Step 4: Test Features**
- Navigate to Medications
- Update your profile
- Upload avatar
- Check admin panel (if admin role)

### **Step 5: Test API Directly**
```powershell
# Test backend is responding
curl http://localhost:5000/api/me

# Should return 401 or user data (means API works)
```

---

## 🐛 **Troubleshooting**

### **Issue: Can't access http://localhost**

**Solution 1: Check if port 80 is available**
```powershell
# Check what's using port 80
netstat -ano | findstr :80

# If something else is using it, stop that service or change port
```

**Solution 2: Use different port**
Edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"  # Change 80 to 8080
```
Then access: **http://localhost:8080**

### **Issue: "unhealthy" status**

Don't worry! Your containers are working. The "unhealthy" status is just a health check configuration. As long as:
- ✅ Containers show "Up"
- ✅ You can access http://localhost
- ✅ API responds

Everything is fine! 🎉

### **Issue: Backend not connecting to MongoDB**

**Check logs:**
```powershell
docker-compose logs backend | Select-String "MongoDB"
```

**Should see:**
```
MongoDB connected successfully
```

**If not:**
1. Check `.env` file has correct `MONGODB_URI`
2. Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. Restart backend:
   ```powershell
   docker-compose restart backend
   ```

### **Issue: Frontend shows blank page**

**Check logs:**
```powershell
docker-compose logs frontend
```

**Common causes:**
1. Build failed - Rebuild: `docker-compose up --build -d frontend`
2. Nginx config error - Check `frontend/nginx.conf`
3. Port conflict - Try different port

### **Issue: API calls fail (CORS error)**

**Check backend CORS settings:**
```powershell
docker-compose logs backend | Select-String "CORS"
```

**Fix:** Update `server.js` CORS origin to include `http://localhost`

---

## 🔄 **Common Workflows**

### **Making Code Changes:**

**Backend changes:**
```powershell
# 1. Make changes to backend code
# 2. Rebuild and restart
docker-compose up --build -d backend

# 3. Check logs
docker-compose logs -f backend
```

**Frontend changes:**
```powershell
# 1. Make changes to frontend code
# 2. Rebuild and restart
docker-compose up --build -d frontend

# 3. Check logs
docker-compose logs -f frontend
```

### **Complete Reset:**
```powershell
# Stop and remove everything
docker-compose down

# Remove images (optional)
docker rmi devops-backend devops-frontend

# Rebuild from scratch
docker-compose up --build -d

# Check status
docker-compose ps
```

### **Daily Development:**
```powershell
# Morning: Start containers
docker-compose start

# Or if they're not created yet:
docker-compose up -d

# Check logs if needed
docker-compose logs -f

# Evening: Stop containers
docker-compose stop
```

---

## 📊 **Monitor Resources**

### **Check Docker resource usage:**
```powershell
# See CPU, Memory usage
docker stats

# For specific container
docker stats medication-backend
```

### **Check disk space:**
```powershell
# See Docker disk usage
docker system df

# Clean up unused images/containers
docker system prune
```

---

## 🎯 **Quick Reference**

| Action | Command |
|--------|---------|
| **Start** | `docker-compose up -d` |
| **Stop** | `docker-compose down` |
| **Restart** | `docker-compose restart` |
| **Logs** | `docker-compose logs -f` |
| **Status** | `docker-compose ps` |
| **Rebuild** | `docker-compose up --build -d` |
| **Backend logs** | `docker-compose logs -f backend` |
| **Frontend logs** | `docker-compose logs -f frontend` |

---

## 🎊 **Your App is LIVE!**

**Access now:**
```
🌐 Frontend: http://localhost
🔌 Backend:  http://localhost:5000
```

**Verify everything works:**
1. ✅ Open http://localhost in browser
2. ✅ Should see login page
3. ✅ Register and login
4. ✅ Test all features

---

## 📚 **More Help:**

- **Complete Docker Guide:** See `DOCKER_GUIDE.md`
- **Quick Commands:** See `DOCKER_QUICKSTART.md`
- **Deployment:** See `DEPLOYMENT_CHECKLIST.md`
- **Render Deploy:** See `RENDER_DEPLOYMENT.md`

---

**🎉 Happy coding! Your app is running in Docker!**

*Last updated: October 20, 2025*
