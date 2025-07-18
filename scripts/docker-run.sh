#!/bin/bash

# Docker run script for neon-landing
set -e

echo "🚀 Starting Neon Landing container..."

# Stop existing container if running
if [ "$(docker ps -q -f name=neon-landing)" ]; then
    echo "🛑 Stopping existing container..."
    docker stop neon-landing
fi

# Remove existing container if exists
if [ "$(docker ps -aq -f name=neon-landing)" ]; then
    echo "🗑️  Removing existing container..."
    docker rm neon-landing
fi

# Run the container
docker run -d \
  --name neon-landing \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e SESSION_SECRET="${SESSION_SECRET:-your-super-secret-key-change-in-production}" \
  -e CORS_ORIGINS="${CORS_ORIGINS:-*}" \
  --restart unless-stopped \
  neon-landing:latest

echo "✅ Container started successfully!"
echo "🌐 Application available at: http://localhost:3000"
echo "📊 Check container status: docker ps"
echo "📋 View logs: docker logs neon-landing"
