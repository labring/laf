

## Intro

This directory contains sealos cluster image building scripts for laf.

## Build

> This would be build automatically in github action. see [build_cluster_images.yml](../.github/workflows/build_cluster_images.yml)

## Usage Images

```bash
# Install laf controllers
sealos run lafyun/laf-controllers:dev

# Install casdoor & service auth in sealos namespace (because service-auth has hard-coding `sealos` namespace in code)
export NODE_IP=$(kubectl get nodes -o jsonpath="{.items[0].status.addresses[0].address}")
export CASDOOR_NODE_PORT=30080
export CASDOOR_ENDPOINT=http://$NODE_IP:$CASDOOR_NODE_PORT
export CASDOOR_CALLBACK_URL=http://localhost:8080/login/callback

kubectl create namespace sealos
sealos run --env NAMESPACE=sealos --env DATABASE=casdoor lafyun/laf-postgresql:dev
sealos run --env NAMESPACE=sealos --env NODE_PORT=${CASDOOR_NODE_PORT} lafyun/laf-casdoor:dev 
sealos run --env NAMESPACE=sealos --env CASDOOR_ENDPOINT=${CASDOOR_ENDPOINT} --env CASDOOR_CALLBACK_URL=${CASDOOR_CALLBACK_URL} lafyun/laf-service-auth:dev


# Install mongodb
kubectl create namespace laf
sealos run --env NAMESPACE=laf lafyun/laf-mongodb:dev
```

