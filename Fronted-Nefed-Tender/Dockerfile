# Use an official Node.js image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's code into the container
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port that the Next.js app runs on
EXPOSE 8001

# Define the command to start the app
CMD ["npm", "run", "start"]
