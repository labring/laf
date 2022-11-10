FROM node:18-alpine
RUN apk add --no-cache openssl


EXPOSE 9000
WORKDIR /app
ENV LOG_LEVEL=debug
COPY . /app
USER node
CMD [ "node", "dist/main" ]