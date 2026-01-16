# Docker Start Script for Billing App (PowerShell)

Write-Host "🚀 Starting Billing App with Docker..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Build and start containers
Write-Host "📦 Building and starting containers..." -ForegroundColor Yellow
docker-compose up --build -d

# Wait for backend to be healthy
Write-Host "⏳ Waiting for backend to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if containers are running
$containers = docker-compose ps
if ($containers -match "Up") {
    Write-Host "✅ Containers are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Access the application:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost"
    Write-Host "   Backend API: http://localhost:8000/api/"
    Write-Host "   Admin Panel: http://localhost:8000/admin/"
    Write-Host ""
    Write-Host "📋 Useful commands:" -ForegroundColor Cyan
    Write-Host "   View logs: docker-compose logs -f"
    Write-Host "   Stop: docker-compose down"
    Write-Host "   Create superuser: docker-compose exec backend python manage.py createsuperuser"
} else {
    Write-Host "❌ Failed to start containers. Check logs with: docker-compose logs" -ForegroundColor Red
    exit 1
}

