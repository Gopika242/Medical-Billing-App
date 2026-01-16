# Docker Deployment Guide

This guide explains how to deploy the Billing App using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode (background):**
   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

## Services

### Backend (Django)
- **Port:** 8000
- **URL:** http://localhost:8000
- **API:** http://localhost:8000/api/
- **Admin:** http://localhost:8000/admin/

### Frontend (React + Nginx)
- **Port:** 80
- **URL:** http://localhost

## Environment Variables

You can customize the deployment by creating a `.env` file in the root directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOW_ALL_ORIGINS=True
DATABASE_URL=sqlite:///db/db.sqlite3
```

Or modify the `docker-compose.yml` file directly.

## Database

By default, the app uses SQLite stored in a Docker volume. The database persists between container restarts.

To use PostgreSQL instead:

1. Add a PostgreSQL service to `docker-compose.yml`:
   ```yaml
   db:
     image: postgres:15-alpine
     environment:
       POSTGRES_DB: billing
       POSTGRES_USER: postgres
       POSTGRES_PASSWORD: postgres
     volumes:
       - postgres_data:/var/lib/postgresql/data
   ```

2. Update the backend service environment:
   ```yaml
   DATABASE_URL=postgresql://postgres:postgres@db:5432/billing
   ```

## Development vs Production

### Development
- Uses volume mounts for live code reloading
- DEBUG=True
- Less strict security settings

### Production
- Remove volume mounts for better performance
- Set DEBUG=False
- Use strong SECRET_KEY
- Configure proper ALLOWED_HOSTS
- Use PostgreSQL instead of SQLite
- Set up SSL/HTTPS

## Common Commands

```bash
# Rebuild containers after code changes
docker-compose up --build

# Run migrations manually
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic

# Access backend shell
docker-compose exec backend python manage.py shell

# View backend logs
docker-compose logs -f backend

# View frontend logs
docker-compose logs -f frontend

# Stop and remove containers, networks, and volumes
docker-compose down -v
```

## Troubleshooting

### Backend won't start
- Check logs: `docker-compose logs backend`
- Ensure all dependencies are in `requirements.txt`
- Verify database connection settings

### Frontend can't connect to backend
- Ensure backend service is healthy: `docker-compose ps`
- Check CORS settings in `backend/backend/settings.py`
- Verify nginx proxy configuration in `frontend/nginx.conf`

### Port already in use
- Change ports in `docker-compose.yml`
- Or stop the service using the port

### Database issues
- Check volume permissions
- Verify DATABASE_URL format
- Run migrations: `docker-compose exec backend python manage.py migrate`

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in environment variables
2. Use a strong `SECRET_KEY`
3. Configure proper `ALLOWED_HOSTS`
4. Use PostgreSQL or another production database
5. Set up SSL/HTTPS (consider using a reverse proxy like Traefik)
6. Remove volume mounts for better security
7. Use Docker secrets for sensitive data
8. Set up proper logging and monitoring

