FROM node:16-alpine
EXPOSE 8080
WORKDIR /app
ENV LOG_LEVEL=debug
ADD . /app
RUN npm i
RUN npm run build
CMD [ "npm", "run", "init-start" ]