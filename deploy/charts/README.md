## Intro

This directory contains required helm charts.

## Usage

### Installation

```bash

# Install laf controllers
sealos run lafyun/laf-controllers:dev

# Install others required components

kubectl create namespace laf || true

export CHARTS_DIR=.

# Install postgresql
export PG_HOST=postgresql
export PG_USERNAME=adm1n
export PG_PASSWORD=passw0rd
export PG_DATABASE=casdoor
helm install postgresql \
  --set service.name=$PG_HOST \
  --set username=$PG_USERNAME \
  --set password=$PG_PASSWORD \
  --set database=$PG_DATABASE \
  --namespace laf \
  $CHARTS_DIR/postgresql

# Install casdoor
export NODE_IP=$(kubectl get nodes -o jsonpath="{.items[0].status.addresses[0].address}")
export CASDOOR_NODE_PORT=30070
export CASDOOR_ENDPOINT=http://$NODE_IP:$CASDOOR_NODE_PORT
export CASDOOR_REDIRECT_URI=http://localhost:8080/login/callback
helm install casdoor \
  --set service.nodePort=$CASDOOR_NODE_PORT \
  --set postgresql.host=$PG_HOST \
  --set postgresql.username=$PG_USERNAME \
  --set postgresql.password=$PG_PASSWORD \
  --set postgresql.database=$PG_DATABASE \
  --set init.redirect_uri=$CASDOOR_REDIRECT_URI \
  --namespace laf \
  $CHARTS_DIR/casdoor

# Install MongoDb
export MONGO_ROOT_USER=admin
export MONOG_ROOT_PASS=passw0rd
helm install mongodb \
  --set db.username=$MONGO_ROOT_USER \
  --set db.password=$MONOG_ROOT_PASS \
  --namespace laf \
  $CHARTS_DIR/mongodb

# Install MinIO
export MINIO_ROOT_USER=minio-root
export MINIO_ROOT_PASS=passw0rd
helm repo add minio https://charts.min.io/
helm install minio \
    --set rootUser=$MINIO_ROOT_USER,rootPassword=$MINIO_ROOT_PASS \
    --set replicas=1 --set resources.requests.memory=100Mi --set drivesPerNode=4 \
    --set persistence.enabled=true --set persistence.storageClass=local-hostpath --set persistence.size=1Gi \
    --namespace laf \
    minio/minio

# Install etcd
helm install etcd --namespace laf  $CHARTS_DIR/etcd

# Install APISIX
export APISIX_ADMIN_KEY=apisix-admin-key-123456
helm repo add apisix https://charts.apiseven.com
helm install apisix \
  --set etcd.enabled=false  \
  --set etcd.host={http://etcd:2379} \
  --set etcd.prefix=/apisix \
  --set admin.credentials.viewer=$APISIX_ADMIN_KEY \
  --set admin.credentials.viewer=apisix-viewer-key-123456 \
  --namespace laf \
  apisix/apisix
```

### Uninstall

```bash
helm delete apisix -n laf
helm delete etcd -n laf
helm delete minio -n laf
helm delete mongodb -n laf
helm delete casdoor -n laf
helm delete postgresql -n laf
```
