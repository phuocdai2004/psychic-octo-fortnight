# Quick Docker Start

## 🚀 Build and Run

```powershell
# 1. Make sure you're in the project root
cd d:\devops

# 2. Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

## 🌐 Access the Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost:5000/api/me

## 📊 Monitor Services

```powershell
# View all logs (real-time)
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# View frontend logs only
docker-compose logs -f frontend

# Check container status
docker-compose ps
```

## 🛑 Stop Services

```powershell
# Stop containers (keeps data)
docker-compose down

# Stop and remove everything
docker-compose down -v
```

## 🔄 Restart After Changes

```powershell
# Backend code changes
docker-compose build backend
docker-compose up -d backend

# Frontend code changes
docker-compose build frontend
docker-compose up -d frontend

# Rebuild everything
docker-compose up --build -d
```

## 🐛 Troubleshooting

### Port conflict:
```powershell
# Check what's using port 80 or 5000
netstat -ano | findstr :80
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

### View logs for errors:
```powershell
docker-compose logs backend
docker-compose logs frontend
```

### Clean rebuild:
```powershell
docker-compose down
docker system prune -a  # Remove all unused images
docker-compose up --build
```

---

**That's it! Your app should be running on http://localhost** 🎉
