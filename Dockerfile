# =============================
# Stage 1: Build client
# =============================
FROM node:18-alpine AS client
WORKDIR /app/client

# Install client dependencies
COPY client/package*.json ./
RUN npm install

# Copy client source and build
COPY client ./
RUN npm run build


# =============================
# Stage 2: Build server
# =============================
FROM node:18-alpine AS server
WORKDIR /app/server

# Install build tools for TypeScript and native modules
RUN apk add --no-cache python3 make g++

# Copy server dependency manifests
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install dependencies and build
RUN npm install
COPY server ./
RUN npm run build


# =============================
# Final Stage: Production Image
# =============================
FROM node:18-alpine
WORKDIR /app

# Copy client build artifacts
COPY --from=client /app/client/dist ./client/dist

# Copy compiled server code and package metadata
COPY --from=server /app/server/dist ./server/dist
COPY --from=server /app/server/package*.json ./server/
COPY --from=server /app/server/node_modules ./server/node_modules

# Runtime permissions setup
RUN mkdir -p /data/uploads && \
    chown -R node:node /data && \
    chown -R node:node /app

USER node
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/dist/index.js"]
