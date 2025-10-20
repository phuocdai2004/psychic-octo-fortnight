# Render Deployment Quick Fix Script
# Run this after making changes

Write-Host "🚀 Preparing for Render Deployment..." -ForegroundColor Cyan

# Navigate to frontend
Set-Location -Path "frontend"

Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`n🔨 Building React app..." -ForegroundColor Yellow
npm run build

Write-Host "`n✅ Checking for _redirects file..." -ForegroundColor Yellow
if (Test-Path "build\_redirects") {
    Write-Host "✓ _redirects file found in build folder" -ForegroundColor Green
} else {
    Write-Host "✗ WARNING: _redirects file NOT found in build folder!" -ForegroundColor Red
    Write-Host "  Make sure public\_redirects exists before building" -ForegroundColor Red
}

Write-Host "`n✅ Build complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Go to Render Dashboard" -ForegroundColor White
Write-Host "2. If using Static Site:" -ForegroundColor White
Write-Host "   - Click 'Manual Deploy' → 'Clear build cache & deploy'" -ForegroundColor Gray
Write-Host "   - Or push to GitHub and auto-deploy will trigger" -ForegroundColor Gray
Write-Host "3. If using Docker:" -ForegroundColor White
Write-Host "   - Push changes to GitHub" -ForegroundColor Gray
Write-Host "   - Render will auto-rebuild" -ForegroundColor Gray
Write-Host "`n4. Set Environment Variable on Render:" -ForegroundColor White
Write-Host "   REACT_APP_API_URL = https://your-backend.onrender.com/api" -ForegroundColor Gray

Write-Host "`n📖 See RENDER_DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan

Set-Location -Path ".."
