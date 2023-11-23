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
- [MinIO](https://min.io) object storage
- [APISIX](https://apisix.apache.org) gateway
- [nestjs-i18n](https://nestjs-i18n.com/) i18n

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
npm run watch
```

> Clean up

```bash
telepresence leave laf-server
```

## Troubleshooting

- `telepresence helm install` failed for `arm64 / Apple Chip` cluster, please upgrade your telepresence to `v2.11.1` or later.
