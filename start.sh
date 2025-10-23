#!/bin/bash

# Colors for output (disable colors for now to avoid display issues)
RED=''
GREEN=''
YELLOW=''
BLUE=''
NC=''

echo ""
echo "🚀 ${GREEN}Starting Video Downloader Web App...${NC}"
echo ""

echo "🐳 ${BLUE}Starting Docker Compose...${NC}"

# Stop any existing containers
echo "🛑 ${YELLOW}Stopping existing containers...${NC}"
docker-compose down

# Start Docker Compose with fresh build
docker-compose up -d --build

# Check if Docker Compose started successfully
if [ $? -eq 0 ]; then
    echo "✅ ${GREEN}Docker Compose started successfully!${NC}"
else
    echo "❌ ${RED}Failed to start Docker Compose${NC}"
    exit 1
fi

echo ""
echo "⏳ ${BLUE}Waiting for application to be ready...${NC}"

# Wait for the application to be ready (max 60 seconds)
MAX_WAIT=60
WAIT_TIME=0
while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    if curl -s -f http://localhost:5000/api/test >/dev/null 2>&1; then
        echo "✅ ${GREEN}Application is ready!${NC}"
        break
    fi
    
    echo -n "."
    sleep 2
    WAIT_TIME=$((WAIT_TIME + 2))
done

if [ $WAIT_TIME -ge $MAX_WAIT ]; then
    echo ""
    echo "⚠️  ${YELLOW}Application may not be fully ready yet, but continuing...${NC}"
fi

echo ""
echo "🎉 ${GREEN}Video Downloader Web App Started Successfully!${NC}"
echo ""
echo "📱 ${BLUE}Access your application at:${NC}"
echo ""
echo "🌐 ${YELLOW}Local Access:${NC}"
echo "   http://localhost:5000"
echo ""
echo "💡 ${BLUE}Network Access Tips:${NC}"
echo "   • Use your computer's IP address to access from other devices"
echo "   • Find your computer's IP: ipconfig (Windows) or ifconfig (Linux/Mac)"
echo "   • Example: http://YOUR_IP:5000"
echo ""
echo "📋 ${BLUE}Additional Information:${NC}"
echo "   • Port: 5000"
echo "   • Health Check: http://localhost:5000/api/test"
echo "   • Stop the app: docker-compose down"
echo "   • View logs: docker-compose logs -f"
echo "   • Restart: ./start.sh"
echo ""
echo "🎬 ${GREEN}Happy downloading!${NC}"
echo ""