#!/bin/bash

# Load environment variables from .env if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

SECRET=${INTERNAL_API_SECRET:-"super_secret_string_123"}

echo "--- Testing Verification Endpoint ---"
curl -X POST http://localhost:3001/api/verify \
  -H "Content-Type: application/json" \
  -H "x-internal-secret: $SECRET" \
  -d '{"signature": "mock_sig", "key": "mock_key", "message": "Login Challenge"}'

echo -e "\n\n--- Testing AI Chat Endpoint ---"
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "x-internal-secret: $SECRET" \
  -d '{"medicineName": "Aspirin", "activeIngredient": "Acetylsalicylic acid", "dosage": "500mg"}'