#!/bin/bash
set -e

# Force Prisma to use glibc binaries (linux-x64)
export PRISMA_CLI_BINARY_TARGETS=linux-x64

# Generate Prisma client with glibc target
npx prisma generate

# Remove any musl binaries that might have been created
rm -rf /app/node_modules/.prisma/client/libquery_engine-linux-musl* 2>/dev/null || true
rm -rf /app/node_modules/.prisma/client/query-engine-linux-musl* 2>/dev/null || true

# Start the application
node dist/main.js
