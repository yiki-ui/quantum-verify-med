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

# 2. Start Unified Portal (Replaces separated portals)
echo -e "\n${BLUE}🌐 Starting Unified Portal (Manufacturer, Consumer, Regulator)...${NC}"
./start-portal.sh
