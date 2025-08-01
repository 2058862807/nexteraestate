# Use Node with Alpine for a smaller image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package and TypeScript config
COPY package.json tsconfig.json ./

# Copy source code (adjust if your app structure differs)
COPY index.ts ./index.ts
COPY services ./services
COPY server ./server

# Install dependencies
RUN npm install

# Compile TypeScript (if using tsc)
RUN npm run build

# Expose your app's port
EXPOSE 8080

# Run the compiled app
CMD ["node", "dist/index.js"]
