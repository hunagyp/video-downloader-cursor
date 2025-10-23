#!/bin/bash

# Video Downloader - Docker Deployment Script

echo "🚀 Starting Video Downloader deployment..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data config

# Build and start the application
echo "🐳 Building Docker image..."
docker-compose build --no-cache

echo "🚀 Starting the application..."
docker-compose up -d

echo "✅ Video Downloader is now running!"
echo "🌐 Access the application at: http://localhost:5000"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop: docker-compose down"
echo "  - Restart: docker-compose restart"
echo "  - Update: docker-compose pull && docker-compose up -d"
