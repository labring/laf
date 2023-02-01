# Intro

`laf server` is responsible for laf http api:

- auth & user
- region cluster
- app management
- app cloud function management
- app database management
- app storage management
- app log management
- app instance management

# Development

## You should know

- [Node.js](https://nodejs.org/en/docs)
- [Nest](https://github.com/nestjs/nest) web framework
- [Kubernetes](https://kubernetes.io) basic use
- [Telepresence](https://www.telepresence.io) for local development
- [MongoDb](https://docs.mongodb.com) basic use
- [Prisma](https://www.prisma.io)
- [MinIO](https://min.io) object storage
- [APISIX](https://apisix.apache.org) gateway
- [Casdoor](https://casdoor.org/)

## Prerequisites

- laf cluster installed locally or remotely (~/.kube/config)
- telepresence installed (see https://www.telepresence.io/reference/install)
- minio client installed (see https://min.io/download#)

## Start service locally

```bash
cd server/

# Install telepresence traffic manager
telepresence helm install
# Connect your computer to laf-dev cluster
telepresence connect
# view the available services, service status needs to be Ready, `ready to intercept`
telepresence list -n laf-system
# Connect local server  to laf server cluster
telepresence intercept server-laf-server -n laf-system -p 3000:3000 -e $(pwd)/.env

npm install
npx prisma generate
npx prisma db push

npm run watch
```

> Clean up

```bash
telepresence leave server-laf-server-laf-system
```
