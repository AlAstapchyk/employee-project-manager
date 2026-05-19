# ==============================================================================
# STAGE 1: Build the Next.js Application
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency configs first for optimal Docker layer caching
COPY package*.json ./

# Install dependencies (including typescript and devDependencies needed for build)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application for production
RUN npm run build

# ==============================================================================
# STAGE 2: Production Runtime
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production and disable telemetry in runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package configurations to install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy static assets and built .next artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./

# Expose internal Next.js frontend port (resolved to FRONTEND_PORT in compose)
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "run", "start"]
