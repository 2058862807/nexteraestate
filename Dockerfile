# Stage 1: Build client
FROM node:18-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client ./
RUN npm run build

# Stage 2: Build server
FROM node:18-alpine AS server
WORKDIR /app/server
# Install build tools only for server deps that need compilation
RUN apk add --no-cache python3 make g++
COPY server/package*.json ./
RUN npm install --production
COPY server ./

# Final stage: Combine client and server
FROM node:18-alpine
WORKDIR /app

# Copy built client assets
COPY --from=client /app/client/dist ./client/dist

# Copy server files and package metadata
COPY --from=server /app/server ./server
COPY --from=server /app/server/package*.json ./server/

# Runtime permissions setup
RUN mkdir -p /data/uploads && \
    chown -R node:node /data && \
    chown -R node:node /app

USER node
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/index.js"]
