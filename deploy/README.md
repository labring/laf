
## Intro

> WARNING: This is a work in progress. The scripts are not yet ready for production use.

> This script is used to deploy the v1.0 development environment. The v1.0 environment has not been released yet, so this script is only for laf contributors to use in the development environment.

## Create development environment on Linux

> TIP: Please confirm to operate under the root user!

```bash
cd deploy

# replace with your domain here.
export DOMAIN=127.0.0.1.nip.io

# install k8s cluster
sh install-on-linux.sh $DOMAIN
```

## Create development environment on MacOS

1. Install multipass on MacOS

```bash
# Skip this step if you have already installed multipass
# see https://multipass.run/install
brew install --cask multipass
```

2. Grant `Settings -> Security & Privacy -> Full Disk Access` for multipassd

3. Create vm & deploy in it

```bash
cd deploy
sh install-on-mac.sh  # create vm & setup in it
```
## Create development environment on Windows

1. Install [multipass](https://multipass.run/install) on Windows

> Skip this step if you have already installed multipass
>
> Note: `Restart` your computer after install multipass

2. Create vm and mount laf into vm
```powershell
multipass launch --name laf-dev --cpus 2 --memory 4G --disk 50G

# Enable multipass mount local directory into vm
multipass set local.privileged-mounts=true

# Mount laf into vm
multipass mount ${YOUR_LAF_DIRECOTRY_PATH} laf-dev:/laf/
```

3. **Remember change CRLF To LF**

File EOF will end by CRLF on windows by default, you need change back to ensure shell scripts could run successfully after mount.


4. Run install-script in vm
```powershell
# Get VM ip
multipass info laf-dev | Where-Object{$_ -match "IPv4"} | ForEach-Object{ ($_ -split "\s+")[1] }
#eg. 172.27.x.y -> 172.27.x.y.nip.io
multipass exec laf-dev -- sudo -u root sh /laf/deploy/install-on-linux.sh $VM_IP_GOT_ABOVE.nip.io
```


5. Wait k8s cluster ready & Copy kubeconfig to host
```powershell
multipass exec $NAME -- sudo -u root kubectl get nodes
# After nodes status changed to Ready, you can copy kubeconfig file into your host machine
multipass exec laf-dev -- sudo -u root cat /root/.kube/config > $HOST_PATH_WHERE_YOU_WANT_LOCATE_CONFIG_FILE
```
