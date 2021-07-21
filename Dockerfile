FROM node:14-alpine
EXPOSE 8080
WORKDIR /app
ENV LOG_LEVEL=debug
ADD . /app
RUN npm i --prod
RUN npm run build
CMD [ "npm", "run", "init-start" ]