#!/bin/bash

# Setup script for neon-landing development environment
set -e

echo "🚀 Setting up Neon Landing development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration"
fi

# Run type checking
echo "🔍 Running type checking..."
npm run typecheck

# Build the project
echo "🏗️  Building the project..."
npm run build

echo "✅ Setup completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Run 'npm run dev' to start development server"
echo "3. Run 'npm run build' to build for production"
echo "4. Run 'npm start' to start production server"
echo ""
echo "🐳 Docker commands:"
echo "- Build: ./scripts/docker-build.sh"
echo "- Run: ./scripts/docker-run.sh"
echo "- Compose: docker-compose up -d"
