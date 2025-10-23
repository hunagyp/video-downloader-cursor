@echo off

REM Video Downloader - Docker Deployment Script for Windows

echo 🚀 Starting Video Downloader deployment...

REM Create necessary directories
echo 📁 Creating directories...
if not exist data mkdir data
if not exist config mkdir config

REM Build and start the application
echo 🐳 Building Docker image...
docker-compose build --no-cache

echo 🚀 Starting the application...
docker-compose up -d

echo ✅ Video Downloader is now running!
echo 🌐 Access the application at: http://localhost:5000
echo.
echo 📋 Useful commands:
echo   - View logs: docker-compose logs -f
echo   - Stop: docker-compose down
echo   - Restart: docker-compose restart
echo   - Update: docker-compose pull ^&^& docker-compose up -d

