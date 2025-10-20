# 🐳 Running Backend API with Docker

## Quick Start

### 1. Setup Environment Variables

```powershell
# Copy the example file
Copy-Item .env.example .env

# Edit .env and fill in your values
notepad .env
```

**Required values:**
- `MONGODB_URI` - Your MongoDB connection string
- `SESSION_SECRET` - Generate using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `CLOUDINARY_*` - Get from Cloudinary dashboard
- `EMAIL_*` - Your Gmail app password

### 2. Build and Run

```powershell
# Build and start the backend
docker-compose up --build -d

# View logs
docker-compose logs -f backend

# Check status
docker-compose ps
```

### 3. Access the API

Backend API is available at:
```
http://localhost:5000
```

Test endpoints:
```powershell
# Health check
curl http://localhost:5000/api/auth/login

# Should return: {"message":"Invalid username or password"}
```

---

## 📋 Docker Commands

### Start/Stop Services

```powershell
# Start backend
docker-compose up -d

# Stop backend
docker-compose down

# Restart backend
docker-compose restart backend

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```powershell
# Follow logs (live)
docker-compose logs -f backend

# Last 50 lines
docker-compose logs --tail=50 backend

# All logs
docker-compose logs backend
```

### Rebuild

```powershell
# Rebuild after code changes
docker-compose up --build -d

# Force rebuild (ignore cache)
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔍 Troubleshooting

### Container Won't Start

Check logs for errors:
```powershell
docker-compose logs backend
```

Common issues:
- ❌ Missing environment variables → Check `.env` file
- ❌ MongoDB connection failed → Verify `MONGODB_URI`
- ❌ Port already in use → Stop other services using port 5000

### MongoDB Connection Failed

1. Check MongoDB Atlas Network Access:
   - Add IP: `0.0.0.0/0` (or your specific IP)
   - Wait 2 minutes for changes

2. Verify connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/medication
   ```

3. Check credentials are correct

### Application Crashes

```powershell
# Check logs
docker-compose logs backend

# Enter container for debugging
docker-compose exec backend sh

# Inside container:
ls -la
node server.js
```

---

## 🧹 Clean Up

### Remove Everything

```powershell
# Stop and remove containers
docker-compose down

# Remove images
docker-compose down --rmi all

# Remove volumes (WARNING: deletes data)
docker-compose down -v --rmi all
```

### Remove Unused Docker Resources

```powershell
# Remove unused containers, networks, images
docker system prune -a

# Remove volumes too (WARNING: deletes data)
docker system prune -a --volumes
```

---

## 🚀 Deployment to Render

See [RENDER_BACKEND_DEPLOYMENT.md](./RENDER_BACKEND_DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Push code to GitHub
2. Create Web Service on Render
3. Select Docker environment
4. Add environment variables
5. Deploy!

---

## 📝 Environment Variables Reference

See [RENDER_ENV_VARS.md](./RENDER_ENV_VARS.md) for complete list.

**Essential variables:**
```bash
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=long-random-string
CORS_ORIGIN=https://your-frontend.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
```

---

## 🔧 Development vs Production

### Development (Local Docker):
```bash
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### Production (Render):
```bash
NODE_ENV=production
PORT=5000  # Or use Render's PORT
CORS_ORIGIN=https://your-frontend-url.com
```

---

## 📊 Container Status

Check if backend is healthy:

```powershell
docker-compose ps
```

Expected output:
```
NAME                 STATUS              PORTS
medication-backend   Up (healthy)        0.0.0.0:5000->5000/tcp
```

If status is "unhealthy", check logs:
```powershell
docker-compose logs backend
```

---

## 🎯 Next Steps

1. ✅ Ensure backend runs locally with Docker
2. ✅ Test all API endpoints
3. ✅ Verify MongoDB connection
4. ✅ Test Cloudinary uploads
5. ✅ Test email functionality
6. ✅ Deploy to Render
7. ✅ Connect frontend to deployed backend

---

**Backend is ready to deploy! 🚀**

See [RENDER_BACKEND_DEPLOYMENT.md](./RENDER_BACKEND_DEPLOYMENT.md) for deployment guide.
