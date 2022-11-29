
## Intro

> WARNING: This is a work in progress. The scripts are not yet ready for production use.

> This script is used to deploy the v1.0 development environment. The v1.0 environment has not been released yet, so this script is only for laf contributors to use in the development environment.

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

3. Start laf server

```bash
# Forward service in cluster to localhost, run this command in another terminal separately
kubectl port-forward deployment/postgresql 5432 -n laf
kubectl port-forward deployments/casdoor 30070:8000 -n laf

# Run these in first time or when someone change the schema.
cd server
npm install
npx prisma db push
npx prisma generate

# run dev
npm run watch
```