FROM node:18-alpine AS client-builder
WORKDIR /app
COPY client/package*.json ./client/
RUN npm install --prefix client
COPY client ./client
RUN npm run build --prefix client

FROM node:18-alpine AS server-builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY server/package*.json ./server/
COPY package*.json ./
RUN npm install --prefix server
COPY server ./server

FROM node:18-alpine
WORKDIR /app
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=server-builder /app/server ./server
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/package*.json ./
RUN npm install --prefix server --production
ENV NODE_ENV=production PORT=8080 FILE_UPLOAD_PATH=/data/uploads MAX_FILE_SIZE=10485760
RUN mkdir -p ${FILE_UPLOAD_PATH} && chown -R node:node ${FILE_UPLOAD_PATH} && chown -R node:node /app
USER node
EXPOSE 8080
CMD ["node", "server/index.js"]
