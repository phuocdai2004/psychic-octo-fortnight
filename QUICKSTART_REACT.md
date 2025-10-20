# Quick Start Guide

## 🚀 Start Both Servers

### Terminal 1 - Backend API (Port 5000)
```powershell
cd d:\devops
npm start
```

### Terminal 2 - React Frontend (Port 3000)
```powershell
cd d:\devops\frontend
npm start
```

## 🌐 Access the Application

Open your browser: **http://localhost:3000**

## 🧪 Test Account

Create a new account or use existing credentials to log in.

## 📍 Available Routes

- `/` - Dashboard (protected)
- `/login` - Login page
- `/register` - Register page
- `/medications` - Medications CRUD (protected)
- `/profile` - User profile (protected)
- `/admin` - Admin dashboard (ADMIN/SUPER_ADMIN only)
- `/admin/users` - User management (ADMIN/SUPER_ADMIN only)

## ⚠️ Important Notes

1. **Backend must be running on port 5000**
2. **Frontend runs on port 3000**
3. **Both servers must be running simultaneously**
4. **MongoDB Atlas connection required** (check .env MONGO_URI)

## 🔧 Troubleshooting

### Port Already in Use
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### CORS Errors
- Ensure backend is running on port 5000
- Check `server.js` CORS origin matches React port (3000)

### Session/Cookie Issues
- Clear browser cookies
- Check backend session configuration in `server.js`

---

For more details, see **REACT_SETUP.md**
