# Stage 1: Build Vite client
FROM node:18-alpine AS client-builder
WORKDIR /app
COPY client/package*.json ./client/
COPY package*.json ./
RUN npm install --prefix client
COPY client ./client
RUN npm run build --prefix client

# Stage 2: Build server
FROM node:18-alpine AS server-builder
WORKDIR /app
COPY server/package*.json ./server/
COPY package*.json ./
RUN npm install --prefix server
COPY server ./server

# Stage 3: Production image
FROM node:18-alpine
WORKDIR /app

# Copy build artifacts
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=server-builder /app/server ./server
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/package*.json ./

# Install production dependencies
RUN npm install --prefix server --production

# Environment configuration
ENV NODE_ENV=production
ENV PORT=8080
ENV FILE_UPLOAD_PATH=/data/uploads
ENV MAX_FILE_SIZE=10485760  # 10MB

# Create upload directory
RUN mkdir -p ${FILE_UPLOAD_PATH}

# Expose port and start
EXPOSE 8080
CMD ["node", "server/index.js"]
FROM node:18-alpine

WORKDIR /app

# Install Python and build tools for native modules
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Build step (if needed)
RUN npm run build --prefix client

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Create data directory for uploads
RUN mkdir -p /data/uploads

# Start the server
CMD ["node", "server/index.js"]
