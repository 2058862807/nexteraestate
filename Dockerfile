# Use Node 18 Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy only the files that exist in your project
COPY client ./client
COPY server ./server
COPY vite.config.ts ./
COPY tsconfig.json ./

# Copy config files only if they exist (optional files)
COPY tailwind.config.* ./
COPY postcss.config.* ./

# Build the application (both client and server)
RUN npm run build

# Expose port 5000 (default Express port)
EXPOSE 5000

# Start the production server
CMD ["npm", "start"]
