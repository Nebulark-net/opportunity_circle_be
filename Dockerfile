FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Environment variables
ENV PORT=5000
EXPOSE 5000

# Start command
CMD [ "npm", "start" ]
