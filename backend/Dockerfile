FROM node:20

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy all source files
COPY . .

# Build TypeScript files
RUN npm run build

# Start the app
CMD ["node", "dist/server.js"]