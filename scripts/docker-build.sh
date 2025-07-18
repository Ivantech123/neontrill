#!/bin/bash

# Docker build script for neon-landing
set -e

echo "🚀 Building Neon Landing Docker image..."

# Build the Docker image
docker build -t neon-landing:latest .

echo "✅ Docker image built successfully!"

# Optional: Tag for different environments
if [ "$1" = "prod" ]; then
    docker tag neon-landing:latest neon-landing:production
    echo "🏷️  Tagged as production"
fi

if [ "$1" = "dev" ]; then
    docker tag neon-landing:latest neon-landing:development
    echo "🏷️  Tagged as development"
fi

echo "🎯 Available images:"
docker images | grep neon-landing
