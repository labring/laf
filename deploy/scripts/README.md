

## Create development environment on Linux
 
```bash
cd deploy/scripts

# setup k8s cluster
sh install-k8s.sh

# setup laf core
sh install-laf-core.sh

# apply laf cluster resources
kubectl apply -f init-laf/
```

## Create development environment on MacOS

1. Install multipass on MacOS

> Skip this step if you have already installed multipass

```bash
brew install --cask multipass  # or see https://multipass.run/install
```

2. Create vm & deploy in it 

```bash
cd deploy/scripts

# create vm & setup k8s in it
sh init-vm.sh  

# setup laf core
multipass exec laf-dev -- sudo -u root sh /laf/deploy/scripts/install-laf-core.sh 

# apply laf cluster resource
multipass exec laf-dev -- sudo -u root kubectl apply -f /laf/deploy/scripts/init-laf/
``` 