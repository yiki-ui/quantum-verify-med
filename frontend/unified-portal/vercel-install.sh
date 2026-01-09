#!/bin/bash
set -e

# Navigate to the crypto shared library
echo "Building @pharma-verify/crypto..."
cd ../shared/crypto

# Install dependencies for crypto
npm install

# Clean any cached dist and rebuild the crypto library
rm -rf dist
npm run build

# Return to the unified-portal directory
cd ../../unified-portal

# Install dependencies for the portal
echo "Installing unified-portal dependencies..."
npm install

echo "Install and build preparation complete!"
