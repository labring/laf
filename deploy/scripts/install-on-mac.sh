#!/usr/bin/env sh

# Intro: Start a VM by multipass with laf deployment environment.

# [ Required ] Install multipass by before run this script (https://multipass.run/install): 
#   MacOS:   brew install --cask multipass
#   Linux:   sudo snap install multipass
#   Windows: https://multipass.run/install

# Usage: ./vm_run.sh <vm_name> <kubeconfig_output>
# - sh vm_run.sh
# - sh vm_run.sh laf-dev ~/.kube/configa

NAME="laf-dev"
# if set first param in command line
if [ -n "$1" ]; then
    NAME="$1"
fi

SCRIPT_DIR=$(pwd)/$(dirname "$0")
PROJECT_ROOT=$SCRIPT_DIR/../..
KUBECONF=~/.kube/config

# if set second param in command line, use it as KUBECONF_DIR
if [ -n "$2" ]; then
    KUBECONF="$2"
fi

KUBECONF_DIR=$(dirname "$KUBECONF")
set -e
# check if .kube path is exist
if [ ! -d "$KUBECONF_DIR" ]; then
    mkdir "$KUBECONF_DIR"
    echo "$KUBECONF_DIR created"
fi

# check if multipass is installed
if ! command -v multipass &> /dev/null
then
    echo "ERROR: multipass could not be found, please install it first:"
    echo "  On MacOS:    brew install --cask multipass"
    echo "  On Linux:    sudo snap install multipass"
    echo "  On Windows:  https://multipass.run/install"
    exit 1
fi

# delete the vm if it already exists
if multipass list | grep -e "^$NAME "; then
    echo "Deleting the existing vm $NAME"
    multipass delete -p "$NAME"
fi

echo "Creating VM..."
echo "\tmultipass launch --name $NAME --cpus 2 --mem 4G --disk 40G"
multipass launch --name "$NAME" --cpus 2 --mem 4G --disk 50G
# shellcheck disable=SC2181
if [ $? -eq 0 ]; then
    echo "vm is created"
else
    echo "ERROR: failed to create vm, please retry"
    exit 1
fi

# wait for vm to be ready
echo "Waiting for vm to be ready..."
while ! multipass list | grep -e "^$NAME " | grep -e "Running"; do
    sleep 1
done

# mount laf project root to vm
echo "Mounting project to vm: $PROJECT_ROOT -> $NAME:/laf/"
multipass mount $PROJECT_ROOT $NAME:/laf/

# shellcheck disable=SC2139
alias vm_root_exec="multipass exec $NAME -- sudo -u root"
vm_ip=$(multipass info "$NAME" | grep IPv4: | awk '{print $2}')

# install k8s cluster
echo "Installing k8s cluster"
DOMAIN="$vm_ip.nip.io"
vm_root_exec sh /laf/deploy/scripts/install-on-linux.sh $DOMAIN

# waiting for k8s cluster to be ready
i=0
while true; do
    echo "Waiting for k8s cluster ready..."
    state=$(vm_root_exec kubectl get nodes | grep Ready | awk '{print $2}')
    if [ "$state" = "Ready" ]; then
        break
    fi
    i=$((i+1))
    if [ $i -gt 100 ]; then
        echo "ERROR: k8s cluster is not ready"
        exit 1
    fi
    sleep 3
done

set -x
set -e
# copy kubeconfig to host
multipass exec "$NAME" -- sudo -u root cat /root/.kube/config > "$KUBECONF"

# replace ip address in kubeconf
sed -i -e "s/apiserver.cluster.local/$vm_ip/g" "$KUBECONF"
set +x

echo "k8s cluster is ready."
echo "ip: $vm_ip"
