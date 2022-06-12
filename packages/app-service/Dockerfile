FROM node:18-alpine
RUN apk add --no-cache openssl

RUN npm install npm -g

EXPOSE 8000
WORKDIR /app
ENV LOG_LEVEL=debug
COPY . /app
# COPY --chown=node:node . /app
# RUN mkdir /app/data || true
# RUN chown node:node /app/data
# RUN npm install
# RUN npm run build
RUN chown -R node:node /app/node_modules
RUN chown node:node /app/package.json
RUN chown node:node /app/package-lock.json

USER node
CMD [ "sh", "/app/start.sh" ]