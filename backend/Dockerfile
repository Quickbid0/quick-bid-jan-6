FROM node:18-alpine

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/edge/main' >> /etc/apk/repositories && apk update && apk add --no-cache libssl1.1 libcrypto1.1 curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Use legacy-peer-deps to avoid NestJS version peer conflicts
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]
