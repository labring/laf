FROM node:14-alpine
EXPOSE 9000
WORKDIR /app
ENV LOG_LEVEL=debug
COPY . /app
RUN mkdir /app/data || true
RUN npm i
RUN npm run build
USER node
CMD [ "npm", "run", "init-start" ]