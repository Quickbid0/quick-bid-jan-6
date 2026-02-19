# QuickMela Backend - Production Dockerfile
# Multi-stage build for optimized production image

# ================================
# BUILD STAGE
# ================================
FROM node:18-bookworm AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Force Prisma to use glibc binaries (linux-x64)
ENV PRISMA_CLI_BINARY_TARGETS=linux-x64

# Install all dependencies (including dev dependencies for build)
# Using --legacy-peer-deps to handle @nestjs/config@4.0.3 with @nestjs/common@9.4.0
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client for glibc
RUN npx prisma generate

# Build application
RUN npm run build

# Remove development dependencies and musl binaries - only keep glibc
RUN npm prune --production && \
    rm -rf /app/node_modules/.prisma/client/libquery_engine-linux-musl* && \
    rm -rf /app/node_modules/.prisma/client/query-engine-linux-musl*

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

# Remove any remaining musl binaries
RUN rm -rf /app/node_modules/.prisma/client/libquery_engine-linux-musl* && \
    rm -rf /app/node_modules/.prisma/client/query-engine-linux-musl*

# Change ownership to non-root user
RUN chown -R quickmela:nodejs /app
USER quickmela

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]

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
