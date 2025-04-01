#!/bin/bash

# Create directory structure
echo "Creating directory structure..."
mkdir -p public/assets

# Build the frontend with Vite
echo "Building frontend..."
npx vite build

# Copy frontend assets to the public directory
echo "Copying frontend assets..."
cp -r dist/* public/
cp vercel-index.html public/index.html

echo "Build completed successfully!"