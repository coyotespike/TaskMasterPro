#!/bin/bash

# Record the start time
echo "Starting build fixes at $(date)"

# Create a special build directory
mkdir -p build-temp
cd build-temp

# Copy the Next.js package.json
cp ../package.json.nextjs package.json

# Install dependencies and build
echo "Installing dependencies..."
npm install 

# Copy and fix the client source files
echo "Copying and fixing client files..."
mkdir -p src
cp -r ../client/src/* src/

# Create Next.js pages directory structure
echo "Setting up Next.js pages structure..."
mkdir -p pages/api
cp -r ../pages/* pages/

# Fix any import paths if needed
sed -i 's/@shared\/schema/@\/shared\/schema/g' src/services/llmService.ts
sed -i 's/import\.meta\.env/process\.env/g' src/**/*.ts
sed -i 's/import\.meta\.env/process\.env/g' src/**/*.tsx

# Ensure Next.js config is in place
cp ../next.config.mjs .

# Create output directory for static build
mkdir -p out

# Build the application
echo "Building Next.js application..."
npm run build

# Copy the output back to the main directory
echo "Copying build output to main directory..."
mkdir -p ../out
cp -r out/* ../out/

echo "Build completed at $(date)"