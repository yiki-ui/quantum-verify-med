#!/bin/bash

# Start PharmaVerify Unified Portal

echo "Starting PharmaVerify Universal Portal..."
cd frontend/unified-portal
npm install # Ensure dependencies are up to date
echo "Starting local backend server on port 3001..."
node server.js &
BACKEND_PID=$!

echo "Starting development server on port 3000..."
npm run dev -- --port 3000

# Cleanup backend on exit
kill $BACKEND_PID
