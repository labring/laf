FROM node:20-slim

RUN apt-get update
RUN apt-get install -y openssl wget libkrb5-dev

ARG TARGETARCH

ENV MINIO_CLIENT_PATH /usr/local/bin/mc
RUN wget https://dl.min.io/client/mc/release/linux-$TARGETARCH/mc -O $MINIO_CLIENT_PATH && chmod +x $MINIO_CLIENT_PATH

RUN export MONGO_TOOLS=mongodb-database-tools-ubuntu1804-$( [ "$TARGETARCH" = "amd64" ] && echo "x86_64" || echo "arm64" )-100.8.0 && \
    wget https://fastdl.mongodb.org/tools/db/${MONGO_TOOLS}.tgz && \
    tar -zxvf ${MONGO_TOOLS}.tgz -C /usr/local/ --strip-components=1 ${MONGO_TOOLS}/bin/ && \
    rm -rf ${MONGO_TOOLS}.tgz $MONGO_TOOLS

WORKDIR /app

EXPOSE 3000

COPY . /app

# All commands in one line will reduce the size of the image
# RUN npm install @nestjs/cli@9.0.0 -g && npm install --omit=dev && npm run build && npm remove @nestjs/cli -g && npm cache clean --force && rm -rf /app/src/*

CMD [ "node", "dist/main" ]