# ==============================================================================
# STAGE 1: Build the NestJS Application
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first for optimal Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Generate Prisma client for the build step
RUN npx prisma generate

# Compile the TypeScript code to NestJS production build
RUN npm run build

# ==============================================================================
# STAGE 2: Production Runtime
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment flag
ENV NODE_ENV=production

# Copy package configurations to install only production dependencies
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci --only=production
RUN npx prisma generate

# Copy only the compiled build files from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the internal backend service port (resolved to BACKEND_PORT dynamically in compose)
EXPOSE 5000

# Start NestJS in production mode
CMD ["node", "dist/main"]
