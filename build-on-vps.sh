#!/bin/bash
# Script to build and run Docker on VPS

echo "=== Building GrowNet on VPS ==="

cd /var/www/GrowNet

# Stop existing containers
echo "[1/4] Stopping existing containers..."
docker-compose down

# Remove old images (optional - uncomment if needed)
# docker image prune -af

# Build with no cache
echo "[2/4] Building Docker images..."
docker-compose build --no-cache

# Start containers
echo "[3/4] Starting containers..."
docker-compose up -d

# Check status
echo "[4/4] Checking container status..."
docker-compose ps

echo ""
echo "=== Build Complete ==="
echo "View logs: docker-compose logs -f"
echo "Frontend: http://202.92.6.223"
echo "Backend: http://202.92.6.223/api/health"
