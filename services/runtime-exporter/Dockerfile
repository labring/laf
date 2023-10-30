# Stage 1: Build
FROM node:18-slim AS build

WORKDIR /app

# Utilize cache mechanism, only execute npm install when dependency files change
COPY package*.json ./
RUN npm install

# Copy other files and directories
COPY . .

# Build the application
RUN npm run build

# Stage 2: Set up production environment
FROM node:18-slim AS production

# Set environment variables
ENV LOG_LEVEL=debug
ENV NODE_ENV=production

WORKDIR /app

# Copy build artifacts from build stage
COPY --from=build /app/dist ./dist
# Copy production dependencies, omitting development dependencies
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Set non-root user for better security
RUN chown -R node:node /app/
USER node

# Expose application port
EXPOSE 2342

# Start the application
CMD [ "npm", "run", "start" ]
