FROM node:16-alpine


EXPOSE 9000
WORKDIR /app
ENV LOG_LEVEL=debug
COPY . /app
# RUN npm i
# RUN npm run build
USER node
CMD [ "npm", "run", "start" ]