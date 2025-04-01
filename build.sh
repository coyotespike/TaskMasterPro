#!/bin/bash

# Ensure we have the production environment variable set
export NODE_ENV=production

# Install dependencies if needed
npm install

# Build the Next.js application
npm run build

# Ensure the .next directory exists
if [ -d "./.next" ]; then
  echo "Build completed successfully. Output directory .next created."
else
  echo "Error: Failed to create .next directory during build process."
  exit 1
fi