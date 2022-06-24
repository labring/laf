FROM node:18-alpine
RUN apk add --no-cache openssl

EXPOSE 8000
WORKDIR /app
ENV LOG_LEVEL=debug
COPY . /app

RUN npm install npm -g
RUN chown node:node /app/package.json && chown node:node /app/package-lock.json

# build files
RUN npm install
RUN npm run build

# clean node_modules
RUN rm -rf /app/node_modules && mkdir /app/node_modules && chown -R node:node /app/node_modules

# COPY --chown=node:node . /app
# RUN mkdir /app/data || true
# RUN chown node:node /app/data
# RUN npm install
# RUN npm run build



USER node
CMD [ "sh", "/app/start.sh" ]