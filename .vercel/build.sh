#!/bin/bash

# Build the frontend with Vite
echo "Building frontend..."
npx vite build

# Create necessary directories
mkdir -p dist/public

# Copy frontend build to the correct location
echo "Copying built files to the right locations..."
cp -r dist/* dist/public/ 2>/dev/null || :

# Build the backend with esbuild
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"