#!/bin/bash
set -e

# Navigate to the crypto shared library
echo "Installing @pharma-verify/crypto dependencies..."
cd ../shared/crypto

# Install and build dependencies for crypto (dist is gitignored)
npm install
npm run build

# Return to the unified-portal directory
cd ../../unified-portal

# Install dependencies for the portal
echo "Installing unified-portal dependencies..."
npm install

echo "Install and build preparation complete!"
