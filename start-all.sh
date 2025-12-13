#!/bin/bash

# PharmaVerify System Startup Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting PharmaVerify System...${NC}"

# Function to kill background processes on exit
cleanup() {
    echo -e "\n${RED} Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# 1. Build Shared Crypto Library
echo -e "\n${BLUE} Building Shared PQC Crypto Library...${NC}"
cd frontend/shared/crypto
if npm run build; then
    echo -e "${GREEN} Crypto library built successfully!${NC}"
else
    echo -e "${RED}❌ Failed to build crypto library.${NC}"
    exit 1
fi
cd ../../..

# 2. Start Manufacturer Portal
echo -e "\n${BLUE}🏭 Starting Manufacturer Portal...${NC}"
cd frontend/manufacturer-portal
npm run dev -- --port 3010 &
MANUFACTURER_PID=$!
cd ../..

# 3. Start Consumer Portal
echo -e "\n${BLUE}👥 Starting Consumer Portal...${NC}"
cd frontend/consumer-portal
npm run dev -- --port 3012 &
CONSUMER_PID=$!
cd ../..

# Wait for services to start
sleep 3

echo -e "\n${GREEN} System is running!${NC}"
echo -e "   - Manufacturer Portal: ${BLUE}http://localhost:3010${NC}"
echo -e "   - Consumer Portal:     ${BLUE}http://localhost:3012${NC}"
echo -e "\nPress ${RED}Ctrl+C${NC} to stop all services."

# Keep script running to maintain background processes
wait
