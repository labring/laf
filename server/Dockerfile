FROM node:18-slim
# FROM ghcr.io/labring/laf-server:1.0.0-alpha.5

RUN apt-get update
RUN apt-get install -y openssl wget

ARG TARGETARCH

ENV MINIO_CLIENT_PATH /usr/local/bin/mc
RUN wget https://dl.min.io/client/mc/release/linux-$TARGETARCH/mc -O $MINIO_CLIENT_PATH && chmod +x $MINIO_CLIENT_PATH

WORKDIR /app

EXPOSE 3000


COPY . /app

RUN npm install
RUN npm run build

CMD [ "node", "dist/main" ]