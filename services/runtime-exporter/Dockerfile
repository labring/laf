FROM node:18-slim AS build

WORKDIR /app

COPY . /app

RUN npm install
RUN npm run build

FROM node:18-slim AS production

ENV LOG_LEVEL=debug
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json

RUN npm ci --production

RUN chown -R node:node /app/

USER node

EXPOSE 2342

CMD [ "npm", "run", "start" ]
