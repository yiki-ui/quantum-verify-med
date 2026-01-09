#!/bin/bash
set -e

# Navigate to the crypto shared library
echo "Installing @pharma-verify/crypto dependencies..."
cd ../shared/crypto

# Install dependencies for crypto (dist is already committed to git)
npm install

# Return to the unified-portal directory
cd ../../unified-portal

# Install dependencies for the portal
echo "Installing unified-portal dependencies..."
npm install

echo "Install and build preparation complete!"
