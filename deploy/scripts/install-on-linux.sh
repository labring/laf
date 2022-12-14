#!/usr/bin/env sh
# Intro: start laf with sealos in linux
# Usage: sh ./install-on-linux.sh <domain>

# TIP: use `sh -x scripts/bare_run.sh` to debug

# set the first param as domain
DOMAIN="$1"
# if domain is empty string, use default domain
if [ -z "$DOMAIN" ]; then
    DOMAIN="127.0.0.1.nip.io"
fi

# Install Sealos
if [ -x "$(command -v apt)" ]; then
  # if apt installed, use `apt` to install
  echo "deb [trusted=yes] https://apt.fury.io/labring/ /" | tee /etc/apt/sources.list.d/labring.list
  apt update
  apt install sealos -y
  
  # fix /etc/hosts overwrite bug in ubuntu while restarting
  sed -i \"/update_etc_hosts/c \\ - ['update_etc_hosts', 'once-per-instance']\" /etc/cloud/cloud.cfg && touch /var/lib/cloud/instance/sem/config_update_etc_hosts
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
sealos run labring/kubernetes:v1.24.0-4.1.1 labring/flannel:v0.19.0 --single

# taint master node
NODENAME=$(kubectl get nodes -ojsonpath='{.items[0].metadata.name}')
kubectl taint node $NODENAME node-role.kubernetes.io/master-
kubectl taint node $NODENAME node-role.kubernetes.io/control-plane-

# install required components
sealos run labring/helm:v3.8.2
sealos run labring/openebs:v1.9.0
sealos run labring/cert-manager:v1.8.0


sealos run --env DOMAIN=$DOMAIN --env DB_PV_SIZE=3Gi --env OSS_PV_SIZE=3Gi lafyun/laf:latest

# Optional installations
#arch=$(arch | sed s/aarch64/arm64/ | sed s/x86_64/amd64/)
#vm_root_exec echo "download buildah in https://github.com/labring/cluster-image/releases/download/depend/buildah.linux.${arch}"
#vm_root_exec wget -qO "buildah" "https://github.com/labring/cluster-image/releases/download/depend/buildah.linux.${arch}"
#vm_root_exec chmod a+x buildah
#vm_root_exec mv buildah /usr/bin
