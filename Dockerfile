# Multi-stage build for production
FROM node:18-alpine AS builder

# Install required tools
RUN apk add --no-cache python3 make g++

# === Backend build ===
WORKDIR /app/backend

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Build using node directly (bypass permission issues)
RUN node node_modules/typescript/bin/tsc

# === Frontend build ===
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Build using node directly (bypass permission issues)
RUN node node_modules/vite/bin/vite.js build

# === Production stage ===
FROM node:18-alpine

WORKDIR /app

# Copy backend production files
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Copy frontend build
COPY --from=builder /app/frontend/dist ./frontend/dist

# Copy Home directory (locales)
COPY Home ./Home

WORKDIR /app/backend

EXPOSE 4000

CMD ["node", "dist/index.js"]
