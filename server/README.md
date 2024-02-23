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
- app billing management
- app domain management
- app certificate management
- app metrics management

# Development

## You should know

- [Node.js](https://nodejs.org/en/docs)
- [Nest](https://github.com/nestjs/nest) web framework
- [Kubernetes](https://kubernetes.io) basic use
- [Telepresence](https://www.telepresence.io) for local development
- [MongoDb](https://docs.mongodb.com) basic use
- [MinIO](https://min.io) object storage

## Prerequisites

- laf cluster installed locally or remotely (~/.kube/config)
- telepresence installed (see <https://www.telepresence.io/reference/install>)
- minio client installed (see <https://min.io/download#>)

## Start service locally

```bash
cd server/

# telepresence version v2.16.1
# Install telepresence traffic manager 
telepresence helm install
# Connect your computer to laf-dev cluster (namespace laf-system)
telepresence connect -n laf-system
# Connect local server to laf server cluster (namespace laf-system)
telepresence intercept laf-server  -p 3000:3000 -e $(pwd)/.env

npm install
npm run dev
```

> Clean up

```bash
telepresence leave laf-server
```