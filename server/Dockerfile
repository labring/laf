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
RUN npm install @nestjs/cli@9.0.0 prisma@4.9.0 -g && npm install --omit=dev && npm run build && npm remove @nestjs/cli prisma -g && npm cache clean --force && rm -rf /app/src/*

# RUN npm install --omit=dev
# RUN npm run build
# RUN npm remove @nestjs/cli prisma -g
# RUN npm cache clean --force

CMD [ "node", "dist/main" ]