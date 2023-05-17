FROM node:18-slim

RUN apt-get update
RUN apt-get install -y openssl wget

ARG TARGETARCH

ENV MINIO_CLIENT_PATH /usr/local/bin/mc
RUN wget https://dl.min.io/client/mc/release/linux-$TARGETARCH/mc -O $MINIO_CLIENT_PATH && chmod +x $MINIO_CLIENT_PATH

WORKDIR /app

EXPOSE 3000

COPY . /app

# All commands in one line will reduce the size of the image
RUN npm install --omit=dev && npm run build && npm cache clean --force && rm -rf /app/src/*

CMD [ "node", "dist/main" ]