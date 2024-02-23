#!/usr/bin/env sh
# Intro: start laf with sealos in linux
# Usage: sh ./install-on-linux.sh <domain>

# TIP: use `sh -x install-on-linux.sh` to debug

# set the first param as domain
DOMAIN="$1"
# if domain is empty string, use default domain
if [ -z "$DOMAIN" ]; then
    DOMAIN="127.0.0.1.nip.io"
fi

# Install Sealos

# if apt installed, use `apt` to install
if [ -x "$(command -v apt)" ]; then
  echo "deb [trusted=yes] https://apt.fury.io/labring/ /" | tee /etc/apt/sources.list.d/labring.list
  apt update
  apt install iptables host -y
  apt install sealos=4.3.5 -y
  apt install jq -y
  
  # fix /etc/hosts overwrite bug in ubuntu while restarting
  sed -i "/update_etc_hosts/c \\ - ['update_etc_hosts', 'once-per-instance']" /etc/cloud/cloud.cfg && touch /var/lib/cloud/instance/sem/config_update_etc_hosts
fi

# if yum installed, use `yum` to install
if [ -x "$(command -v yum)" ]; then
  cat > /etc/yum.repos.d/labring.repo << EOF
[fury]
name=labring Yum Repo
baseurl=https://yum.fury.io/labring/
enabled=1
gpgcheck=0
EOF
  # yum update
  yum clean all
  yum install -y bind-utils iptables
  yum install sealos=4.3.7 -y
  yum install jq -y
fi

ARCH=$(arch | sed s/aarch64/arm64/ | sed s/x86_64/amd64/)
echo "ARCH: $ARCH"

# if sealos not installed
if [ ! -x "$(command -v sealos)" ]; then
    echo "sealos not installed"
    exit 1
fi

set -e

# pull sealos cluster images
sealos pull labring/kubernetes:v1.24.9
sealos pull labring/flannel:v0.19.0
sealos pull labring/helm:v3.8.2
sealos pull labring/openebs:v1.9.0
sealos pull labring/cert-manager:v1.8.0
sealos pull labring/metrics-server:v0.6.2
sealos pull lafyun/laf:latest
sealos pull docker.io/labring/ingress-nginx:v1.8.1
sealos pull labring/kubeblocks:v0.7.1

# install k8s cluster
sealos run labring/kubernetes:v1.24.9 labring/flannel:v0.19.0 labring/helm:v3.8.2

# taint master node
NODENAME=$(kubectl get nodes -ojsonpath='{.items[0].metadata.name}')
kubectl taint node $NODENAME node-role.kubernetes.io/master- || true
kubectl taint node $NODENAME node-role.kubernetes.io/control-plane- || true

# install required components
sealos run labring/openebs:v1.9.0
sealos run labring/cert-manager:v1.8.0
sealos run labring/metrics-server:v0.6.2
sealos run docker.io/labring/ingress-nginx:v1.8.1 \
  -e HELM_OPTS="--set controller.hostNetwork=true --set controller.kind=DaemonSet --set controller.service.enabled=false"
sealos run labring/kubeblocks:v0.7.1


sealos run --env DOMAIN=$DOMAIN --env DB_PV_SIZE=5Gi --env OSS_PV_SIZE=5Gi --env EXTERNAL_HTTP_SCHEMA=http lafyun/laf:latest
