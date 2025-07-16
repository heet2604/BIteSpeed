# Use official Node.js image
FROM node:18

# Create and set working directory inside the container
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend files
COPY . .

# Expose the port your app listens on (adjust if different)
EXPOSE 5000

# Default command to run your app
CMD ["node", "server.js"]
