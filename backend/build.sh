#!/bin/bash
# Build script for deployment
cd backend
python manage.py collectstatic --noinput
python manage.py migrate --noinput

