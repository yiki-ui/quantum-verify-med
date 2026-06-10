#!/bin/bash

# Start PharmaVerify Unified Portal

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting PharmaVerify Unified Portal...${NC}"
echo -e "${BLUE}Starting Vite dev server on http://localhost:5173${NC}"

cd frontend/unified-portal && npm run dev
