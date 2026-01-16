#!/bin/bash

# Docker Start Script for Billing App

echo "🚀 Starting Billing App with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Build and start containers
echo "📦 Building and starting containers..."
docker-compose up --build -d

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Containers are running!"
    echo ""
    echo "📍 Access the application:"
    echo "   Frontend: http://localhost"
    echo "   Backend API: http://localhost:8000/api/"
    echo "   Admin Panel: http://localhost:8000/admin/"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop: docker-compose down"
    echo "   Create superuser: docker-compose exec backend python manage.py createsuperuser"
else
    echo "❌ Failed to start containers. Check logs with: docker-compose logs"
    exit 1
fi

