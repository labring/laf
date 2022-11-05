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

# install laf cluster images
# TODO