FROM node:16-alpine
RUN apk add --no-cache openssl
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

ENV MINIO_CLIENT_PATH /usr/local/bin/mc
RUN wget https://dl.min.io/client/mc/release/linux-amd64/mc -O $MINIO_CLIENT_PATH && chmod +x $MINIO_CLIENT_PATH

EXPOSE 9000
WORKDIR /app
ENV LOG_LEVEL=debug
COPY . /app
# RUN npm i
# RUN npm run build
USER node
CMD [ "npm", "run", "start" ]