#!/bin/bash
set -e

echo "=== QuickMela Backend Startup ==="
echo "Step 1: Verify/Generate Prisma Client..."

# Check if Prisma files exist, regenerate if missing
if [ ! -f "node_modules/.prisma/client/index.js" ]; then
  echo "  ⚠️  Prisma client not found. Regenerating..."
  
  # Install dependencies if needed
  if [ ! -d "node_modules/@prisma" ]; then
    echo "  Installing @prisma packages..."
    npm ci --omit=dev --legacy-peer-deps 2>/dev/null || npm install --omit=dev --legacy-peer-deps
  fi
  
  # Generate Prisma
  npx prisma generate || {
    echo "  ❌ Failed to generate Prisma client"
    exit 1
  }
else
  echo "  ✓ Prisma client found at node_modules/.prisma/client/index.js"
fi

echo "Step 2: Starting Node application..."
echo "  PORT: ${PORT:-3001}"

# Use exec to replace this shell process with Node (proper signal handling)
exec node dist/main.js
