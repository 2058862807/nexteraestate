# Stage 1: Build Vite client
FROM node:18-alpine AS client-builder
WORKDIR /app
COPY client/package*.json ./client/
RUN npm install --prefix client
COPY client ./client
RUN npm run build --prefix client

# Stage 2: Build server (with build tools)
FROM node:18-alpine AS server-builder
WORKDIR /app
# Install build tools only for server dependencies
RUN apk add --no-cache python3 make g++
COPY server/package*.json ./server/
COPY package*.json ./
RUN npm install --prefix server
COPY server ./server

# Stage 3: Production image
FROM node:18-alpine
WORKDIR /app

# Copy built artifacts
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=server-builder /app/server ./server
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/package*.json ./

# Install only production server dependencies
RUN npm install --prefix server --production

# Environment configuration
ENV NODE_ENV=production
ENV PORT=8080
ENV FILE_UPLOAD_PATH=/data/uploads
ENV MAX_FILE_SIZE=10485760  # 10MB

# Create directories
RUN mkdir -p ${FILE_UPLOAD_PATH} && \
    chown -R node:node ${FILE_UPLOAD_PATH} && \
    chown -R node:node /app

# Security best practice - run as non-root user
USER node

EXPOSE 8080
CMD ["node", "server/index.js"]
