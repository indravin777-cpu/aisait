FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies (using package.json)
COPY package.json .
COPY package-lock.json .
RUN npm ci --only=production

# Copy the rest of the app's source code
COPY . .

# Expose the port (Railway will set PORT env var)
EXPOSE $PORT

# Start the server
CMD ["node", "server.js"]
