
## Intro

This directory contains required helm charts.

## Usage

### Installation

```bash

# Install casdoor & service auth in sealos namespace (because service-auth has hard-coding `sealos` namespace in code)
kubectl create namespace sealos || true

export PG_HOST=postgresql
export PG_USERNAME=adm1n
export PG_PASSWORD=passw0rd
export PG_DATABASE=casdoor

export NODE_IP=$(kubectl get nodes -o jsonpath="{.items[0].status.addresses[0].address}")
export CASDOOR_NODE_PORT=30080
export CASDOOR_ENDPOINT=http://$NODE_IP:$CASDOOR_NODE_PORT
export CASDOOR_CALLBACK_URL=http://localhost:8080/login/callback

helm install postgresql \
  --set service.name=$PG_HOST \
  --set username=$PG_USERNAME \
  --set password=$PG_PASSWORD \
  --set database=$PG_DATABASE \
  ./postgresql --namespace sealos

helm install casdoor \ 
  --set service.nodePort=$CASDOOR_NODE_PORT \
  --set postgresql.host=$PG_HOST \
  --set postgresql.username=$PG_USERNAME \
  --set postgresql.password=$PG_PASSWORD \
  --set postgresql.database=$PG_DATABASE \
  --namespace sealos \
  ./casdoor

helm install service-auth \
  --set config.endpoint=$CASDOOR_ENDPOINT \
  --set config.callbackUrl=$CASDOOR_CALLBACK_URL \
  --namespace sealos \
  ./service-auth

# Install mongodb
kubectl create namespace laf || true

helm install mongodb \
  --set db.username=admin \
  --set db.password=passw0rd \
  --namespace laf \
  ./mongodb

```

### Uninstall

```bash
kubectl delete namespace laf
kubectl delete namespace sealos
```