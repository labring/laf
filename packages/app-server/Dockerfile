FROM node:14-alpine
EXPOSE 8000
WORKDIR /app
ENV LOG_LEVEL=debug
COPY . /app
RUN mkdir /app/data || true
RUN chown node:node /app/data
RUN npm i
RUN npm run build
USER node
CMD [ "npm", "run", "start" ]