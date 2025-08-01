# Use Node with Alpine for smaller image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json tsconfig.json ./
COPY services ./services
COPY scheduled ./scheduled
COPY index.ts ./index.ts

# Install dependencies
RUN npm install

# Build the app (optional — remove if not using TypeScript build step)
RUN npm run build

# Expose port
EXPOSE 8080

# Start the app
CMD ["node", "dist/index.js"]
