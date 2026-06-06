# ==============================================================================
# Stage 1: Builder
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for optimal layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for building)
RUN npm ci --ignore-scripts

# Copy source code and build configuration
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/

# Build the TypeScript project
RUN npm run build

# Prune devDependencies after build
RUN npm prune --production

# ==============================================================================
# Stage 2: Production
# ==============================================================================
FROM node:20-alpine AS production

# Add labels for image metadata
LABEL maintainer="DRMS Team"
LABEL org.opencontainers.image.title="DRMS API"
LABEL org.opencontainers.image.description="Enterprise Digital Rights Management System"
LABEL org.opencontainers.image.source="https://github.com/drms-team/drms"

# Install dumb-init for proper PID 1 signal handling and curl for healthcheck
RUN apk add --no-cache dumb-init curl

# Set production environment
ENV NODE_ENV=production

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled application from builder
COPY --from=builder /app/dist ./dist

# Copy package.json for runtime metadata
COPY --from=builder /app/package.json ./

# Create a non-root user and group
RUN addgroup -g 1001 -S drms && \
    adduser -S drms -u 1001 -G drms

# Change ownership of application files
RUN chown -R drms:drms /app

# Switch to non-root user
USER drms

# Expose the application port
EXPOSE 3000

# Healthcheck to verify the application is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Use dumb-init as PID 1 to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]
