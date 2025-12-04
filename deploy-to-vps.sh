#!/bin/bash
# Deploy GrowNet Backend to VPS

echo "================================"
echo "  GROWNET BACKEND DEPLOYMENT"
echo "================================"
echo ""

# 1. Check current directory
echo "[1] Checking current location..."
cd /root/GrowNet || { echo "Error: Cannot find /root/GrowNet"; exit 1; }
echo "✓ In directory: $(pwd)"
echo ""

# 2. Check current git status
echo "[2] Checking git status..."
git status
echo ""

# 3. Stash any local changes
echo "[3] Stashing local changes..."
git stash
echo ""

# 4. Pull latest code
echo "[4] Pulling latest code from GitHub..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "Error: Failed to pull code"
    exit 1
fi
echo "✓ Code updated successfully"
echo ""

# 5. Install backend dependencies
echo "[5] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Error: npm install failed"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# 6. Build backend
echo "[6] Building backend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Build failed"
    exit 1
fi
echo "✓ Build completed"
echo ""

# 7. Check PM2 status
echo "[7] Checking PM2 status..."
pm2 list
echo ""

# 8. Restart backend service
echo "[8] Restarting backend service..."
pm2 restart grownet-backend
if [ $? -ne 0 ]; then
    echo "Warning: PM2 restart failed, trying to start..."
    pm2 start dist/index.js --name grownet-backend
fi
echo "✓ Service restarted"
echo ""

# 9. Show logs
echo "[9] Showing recent logs..."
pm2 logs grownet-backend --lines 30 --nostream
echo ""

# 10. Save PM2 configuration
echo "[10] Saving PM2 configuration..."
pm2 save
echo ""

echo "================================"
echo "  DEPLOYMENT COMPLETED!"
echo "================================"
echo ""
echo "Backend should now be running with latest code."
echo "Test it: curl http://localhost:4000/api/health"
echo ""
