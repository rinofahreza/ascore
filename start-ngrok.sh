#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Laravel PWA with Ngrok${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Configure ngrok authtoken
echo -e "${YELLOW}Configuring ngrok...${NC}"
ngrok config add-authtoken 37ZCWtqL9IEOvA8d6mcFQlMStFW_6AbQttL2ZM2xsQYhsWeg1

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please copy .env.example to .env and configure it first."
    exit 1
fi

# Build Vite assets for production
echo -e "${YELLOW}Building Vite assets...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build Vite assets${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Vite assets built successfully${NC}"
echo ""

# Start Laravel development server in background
echo -e "${YELLOW}Starting Laravel development server...${NC}"
php artisan serve --host=127.0.0.1 --port=8000 > /dev/null 2>&1 &
LARAVEL_PID=$!

# Wait for Laravel to start
sleep 3

# Check if Laravel is running
if ! ps -p $LARAVEL_PID > /dev/null; then
    echo -e "${RED}Failed to start Laravel server${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Laravel server started (PID: $LARAVEL_PID)${NC}"

# Start ngrok
echo -e "${YELLOW}Starting ngrok tunnel...${NC}"
echo ""

# Start ngrok and capture output
ngrok http 8000 --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get ngrok URL
echo -e "${YELLOW}Fetching ngrok URL...${NC}"
sleep 2

# Get the public URL from ngrok API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}Failed to get ngrok URL${NC}"
    echo "Trying to get URL from log..."
    NGROK_URL=$(grep -o 'url=https://[^ ]*' ngrok.log | head -1 | cut -d'=' -f2)
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  🚀 Server is running!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}Local:${NC}      http://localhost:8000"
echo -e "${BLUE}Ngrok:${NC}      ${GREEN}${NGROK_URL}${NC}"
echo ""
echo -e "${YELLOW}📱 PWA Features:${NC}"
echo -e "  ✓ HTTPS enabled via ngrok"
echo -e "  ✓ Service Worker active"
echo -e "  ✓ Offline support"
echo -e "  ✓ Installable on any device"
echo ""
echo -e "${YELLOW}📊 Ngrok Dashboard:${NC} http://localhost:4040"
echo ""
echo -e "${YELLOW}To stop the server:${NC}"
echo -e "  Press ${RED}Ctrl+C${NC} or run: ${RED}kill $LARAVEL_PID $NGROK_PID${NC}"
echo ""
echo -e "${GREEN}================================${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $LARAVEL_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    rm -f ngrok.log
    echo -e "${GREEN}✓ Servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Keep script running
echo -e "${BLUE}Server is running. Press Ctrl+C to stop...${NC}"
echo ""

# Wait for processes
wait $LARAVEL_PID $NGROK_PID
