# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# 1. Copy dependency files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# 2. Install dependencies
RUN npm install
RUN npm install --prefix client
RUN npm install --prefix server

# 3. Copy ALL source code
COPY . .

# 4. Build client (Vite)
RUN npm run build --prefix client

# 5. Set production environment
ENV NODE_ENV=production

# 6. Expose port (match your server's port)
EXPOSE 8080

# 7. Start server - CHANGE IF YOUR COMMAND IS DIFFERENT!
CMD ["npm", "run", "start", "--prefix", "server"]
