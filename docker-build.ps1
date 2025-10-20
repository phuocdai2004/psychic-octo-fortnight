# Build script for Docker
# Run this to build and start the application

Write-Host "🐳 Building and starting Docker containers..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Error: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Build and start containers
Write-Host "Building containers..." -ForegroundColor Green
docker-compose build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting containers..." -ForegroundColor Green
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Application started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📍 Access points:" -ForegroundColor Cyan
        Write-Host "   Frontend: http://localhost" -ForegroundColor White
        Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
        Write-Host ""
        Write-Host "📊 View logs:" -ForegroundColor Cyan
        Write-Host "   docker-compose logs -f" -ForegroundColor White
        Write-Host ""
        Write-Host "🛑 Stop services:" -ForegroundColor Cyan
        Write-Host "   docker-compose down" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "❌ Failed to start containers" -ForegroundColor Red
        Write-Host "Run 'docker-compose logs' to see errors" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
}
