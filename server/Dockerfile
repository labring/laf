FROM node:18-alpine
RUN apk add --no-cache openssl


EXPOSE 3000
WORKDIR /app
ENV LOG_LEVEL=debug
COPY . /app
USER node
CMD [ "node", "dist/main" ]