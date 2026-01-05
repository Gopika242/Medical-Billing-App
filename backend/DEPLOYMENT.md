# Backend Deployment Guide

This guide will help you deploy the Django backend to Railway or Render.

## Option 1: Deploy to Railway (Recommended - Free Tier Available)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your repository and select it

### Step 3: Add PostgreSQL Database
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically set

### Step 4: Configure Environment Variables
In Railway project settings, add these environment variables:

```
SECRET_KEY=your-generated-secret-key-here
DEBUG=False
ALLOWED_HOSTS=*.railway.app,your-custom-domain.com
CORS_ALLOWED_ORIGINS=https://medical-billing-blond.vercel.app,https://your-frontend-domain.vercel.app
```

To generate a SECRET_KEY, run:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 5: Configure Build Settings
- **Root Directory**: Leave empty (or set to `backend` if needed)
- **Build Command**: Railway will auto-detect
- **Start Command**: `cd backend && python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT`

### Step 6: Deploy
Railway will automatically deploy. After deployment:
1. Copy your backend URL (e.g., `https://your-app.railway.app`)
2. Update your frontend's `VITE_API_BASE_URL` environment variable in Vercel to: `https://your-app.railway.app/api/`

---

## Option 2: Deploy to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Select the repository

### Step 3: Configure Service
- **Name**: medical-billing-api (or your choice)
- **Environment**: Python 3
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- **Start Command**: `gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT`

### Step 4: Add PostgreSQL Database
1. Click "New" → "PostgreSQL"
2. Create a database
3. Copy the connection string

### Step 5: Set Environment Variables
In Render dashboard, add:
```
SECRET_KEY=your-generated-secret-key-here
DEBUG=False
ALLOWED_HOSTS=*.onrender.com,your-custom-domain.com
DATABASE_URL=<paste-postgresql-connection-string>
CORS_ALLOWED_ORIGINS=https://medical-billing-blond.vercel.app
```

### Step 6: Deploy
1. Click "Create Web Service"
2. Wait for deployment
3. Copy your backend URL
4. Update frontend `VITE_API_BASE_URL` in Vercel

---

## Local Development Setup

For local development, create a `.env` file in the `backend` directory:

```env
SECRET_KEY=your-local-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
# Database will use SQLite by default locally
```

Then run:
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Post-Deployment Steps

After deploying, don't forget to:

1. **Run Migrations**: Most platforms auto-run migrations, but verify in logs
2. **Create Superuser**: Connect to your database and run:
   ```bash
   python manage.py createsuperuser
   ```
3. **Update Frontend**: Update `VITE_API_BASE_URL` in Vercel to point to your deployed backend
4. **Test API**: Visit `https://your-backend-url/api/` to verify it's working

## Troubleshooting

- **500 Error**: Check logs for database connection issues
- **CORS Errors**: Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- **Static Files**: WhiteNoise should handle static files automatically
- **Database Connection**: Ensure `DATABASE_URL` is set correctly

