#!/usr/bin/env sh
# Intro: start laf with sealos in linux
# Usage: sh ./bare_run.sh

# TIP: use `sh -x scripts/bare_run.sh` to debug

# Install Sealos
if [ -x "$(command -v apt)" ]; then
  # if apt installed, use `apt` to install
  echo "deb [trusted=yes] https://apt.fury.io/labring/ /" | tee /etc/apt/sources.list.d/labring.list
  apt update
  apt install sealos=4.1.3 -y
else
  echo "apt not installed"
fi

if [ -x "$(command -v yum)" ]; then
  # if yum installed, use `yum` to install
  cat > /etc/yum.repos.d/labring.repo << EOF
[fury]
name=labring Yum Repo
baseurl=https://yum.fury.io/labring/
enabled=1
gpgcheck=0
EOF
  yum update
  yum install sealos -y
else
  echo "yum not installed"
fi


# install k8s cluster
sealos run labring/kubernetes:v1.24.0 labring/flannel:v0.19.0 --single

# taint master node
NODENAME=$(kubectl get nodes -ojsonpath='{.items[0].metadata.name}')
kubectl taint node $NODENAME node-role.kubernetes.io/master-
kubectl taint node $NODENAME node-role.kubernetes.io/control-plane-

# install required components
sealos run labring/helm:v3.8.2
sealos run labring/openebs:v1.9.0
sealos run labring/cert-manager:v1.8.0
sealos run labring/sealos-user-controller:dev

# Install laf controllers
sealos run lafyun/laf-controllers:dev

# Install others required components

# Install casdoor & service auth in sealos namespace (because service-auth has hard-coding `sealos` namespace in code)
kubectl create namespace sealos || true

export CHARTS_DIR=$(pwd)/$(dirname "$0")/../../charts

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
  $CHARTS_DIR/postgresql --namespace sealos

helm install casdoor \ 
  --set service.nodePort=$CASDOOR_NODE_PORT \
  --set postgresql.host=$PG_HOST \
  --set postgresql.username=$PG_USERNAME \
  --set postgresql.password=$PG_PASSWORD \
  --set postgresql.database=$PG_DATABASE \
  --namespace sealos \
  $CHARTS_DIR/casdoor

helm install service-auth \
  --set config.endpoint=$CASDOOR_ENDPOINT \
  --set config.callbackUrl=$CASDOOR_CALLBACK_URL \
  --namespace sealos \
  $CHARTS_DIR/service-auth

# Install mongodb
kubectl create namespace laf || true

helm install mongodb \
  --set db.username=admin \
  --set db.password=passw0rd \
  --namespace laf \
  $CHARTS_DIR/mongodb