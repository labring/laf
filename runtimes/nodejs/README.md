
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

# Start local service first, required nodejs version >= 18.0.0
npm install

npm run build

npm start
# intercept
telepresence intercept APPID -n APPID -p 8000:8000 -e $(pwd)/.env

# after intercept command, you can use following command to check if intercept active
telepresence list -n APPID
# if success, you would see like below
Your-APPID: intercepted
   Intercept name         : APPID-APPID
   State                  : ACTIVE
   Workload kind          : Deployment
   Destination            : 127.0.0.1:8000
   Service Port Identifier: 8000
   Intercepting           : all TCP requests
```

> Clean up

```bash
telepresence leave APPID-APPID
```