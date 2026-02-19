# QuickMela Backend - Production Dockerfile
# Multi-stage build for optimized production image

# ================================
# BUILD STAGE
# ================================
FROM node:18-bookworm AS builder

# Set working directory
WORKDIR /app

# Force Prisma to use glibc binaries (linux-x64) - MUST be set before npm ci
ENV PRISMA_CLI_BINARY_TARGETS=linux-x64

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
# Using --legacy-peer-deps to handle @nestjs/config@4.0.3 with @nestjs/common@9.4.0
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client for glibc
RUN npx prisma generate

# Build application
RUN npm run build

# Remove development dependencies (keep Prisma - already generated)
RUN npm prune --production

# Verify Prisma files exist and list them
RUN echo "=== Checking Prisma files after npm prune ===" && \
    if [ -d "node_modules/.prisma" ]; then \
      echo "✓ Prisma directory found"; \
      ls -lh node_modules/.prisma/client/ 2>/dev/null | head -5 || echo "  (Warning: client subdirectory missing)"; \
    else \
      echo "✗ ERROR: Prisma directory missing!"; \
      exit 1; \
    fi

# ================================
# PRODUCTION STAGE
# ================================
FROM node:18-bookworm AS production

# Install production runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    curl \
    postgresql-client && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S quickmela -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Force all Prisma operations to use glibc (linux-x64)
ENV PRISMA_CLI_BINARY_TARGETS=linux-x64

# Copy production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

# Copy environment configuration (Railway will override with platform variables)
COPY .env.production ./.env.production

# Set production environment
ENV NODE_ENV=production

# Verify Prisma client was copied
RUN echo "=== Verifying Prisma client in production image ===" && \
    if [ -f "node_modules/.prisma/client/index.js" ]; then \
      echo "✓ Prisma client index.js found"; \
      ls -lh node_modules/.prisma/client/index.js; \
    else \
      echo "✗ ERROR: Prisma client index.js NOT FOUND!"; \
      ls -la node_modules/.prisma/ || echo "  .prisma directory also missing"; \
      exit 1; \
    fi

# Change ownership to non-root user
RUN chown -R quickmela:nodejs /app && \
    chmod -R u+w /app/node_modules

# Switch to non-root user
USER quickmela

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Ensure Prisma is generated at startup, then start the app
CMD ["sh", "-c", "npx prisma generate 2>/dev/null || true && node dist/main.js"]

# ================================
# METADATA
# ================================
LABEL maintainer="QuickMela Team <dev@quickmela.com>" \
      version="1.0.0" \
      description="QuickMela Backend - AI-Powered Auction Platform" \
      org.opencontainers.image.source="https://github.com/quickmela/backend"

# ================================
# SECURITY NOTES
# ================================
# - Uses non-root user for security
# - Minimal attack surface with Alpine Linux
# - No development dependencies in production
# - Proper signal handling with dumb-init
# - Health checks for container orchestration
# - Multi-stage build for smaller image size
