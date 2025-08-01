# =============================
# Stage 1: Build client
# =============================
FROM node:18-alpine AS client
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client ./
RUN npm run build


# =============================
# Stage 2: Build server
# =============================
FROM node:18-alpine AS server
WORKDIR /app/server

RUN apk add --no-cache python3 make g++

COPY server/package*.json ./
COPY server/tsconfig.json ./
# Copy server source and build
COPY server ./
RUN npm run build


# =============================
# Final Stage: Production Image
# =============================
FROM node:18-alpine
WORKDIR /app

# Copy built client
COPY --from=client /app/client/dist ./client/dist

# Copy built server
COPY --from=server /app/server/dist ./server/dist
COPY --from=server /app/server/package*.json ./server/
COPY --from=server /app/server/node_modules ./server/node_modules

# Set permissions
RUN mkdir -p /data/uploads && \
    chown -R node:node /data && \
    chown -R node:node /app

USER node
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/dist/index.js"]
RUN npm install

COPY server ./
RUN npm run build


# =============================
# Final Stage: Production Image
# =============================
FROM node:18-alpine
WORKDIR /app

# Copy built client
COPY --from=client /app/client/dist ./client/dist

# Copy built server
COPY --from=server /app/server/dist ./server/dist
COPY --from=server /app/server/package*.json ./server/
COPY --from=server /app/server/node_modules ./server/node_modules

# Set permissions
RUN mkdir -p /data/uploads && \
    chown -R node:node /data && \
    chown -R node:node /app

USER node
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/dist/index.js"]

