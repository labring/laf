FROM node:20.10.0

# Set environment variables
ENV LOG_LEVEL=debug
ENV NODE_ENV=production

WORKDIR /app

COPY ./dist /app/dist
COPY ./node_modules /app/node_modules
COPY ./package*.json /app/

# Set non-root user for better security
RUN chown -R node:node /app
USER node

# Expose application port
EXPOSE 2342

# Start the application
CMD [ "npm", "run", "start" ]
