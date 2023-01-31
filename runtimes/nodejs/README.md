
# Intro

`runtime-nodejs` is the application service engine of `laf`, responsible for:

- The execution of the cloud function
- Database access proxy

# Development

## You should know

- [Node.js](https://nodejs.org/en/docs)
- [Express](https://expressjs.com) web framework
- [Kubernetes](https://kubernetes.io) basic use
- [Telepresence](https://www.telepresence.io) for local development
- [MongoDb](https://docs.mongodb.com) basic use

## Prerequisites

- laf cluster installed locally or remotely (~/.kube/config)
- telepresence installed (see https://www.telepresence.io/reference/install)
- a running app in laf cluster (appid)

## Start service locally

```sh
cd runtimes/nodejs

# proxy app cluster traffic to local, replace `APPID` with your prepared appid
telepresence connect
telepresence intercept APPID -n APPID -p 8000:8000 -e $(pwd)/.env

# required nodejs version >= 18.0.0
npm install

npm run build

npm start
```