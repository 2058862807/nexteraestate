# Use Node with Alpine for smaller image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json tsconfig.json ./
COPY services ./services
COPY scheduled ./scheduled
COPY server ./server
COPY .env .env

RUN npm install
RUN npm run build

# Expose port (customize if your server uses something else)
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]
