# FROM node:18-slim
FROM ghcr.io/labring/laf-server:1.0.0-alpha.1

RUN apt-get update
RUN apt-get install -y openssl

ARG TARGETARCH

WORKDIR /app

EXPOSE 3000

COPY . /app

RUN npm install
RUN npm run build

CMD [ "node", "dist/main" ]