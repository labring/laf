
## Intro

> WARNING: This is a work in progress. The scripts are not yet ready for production use.

> This script is used to deploy the v1.0 development environment. The v1.0 environment has not been released yet, so this script is only for laf contributors to use in the development environment.

## Create development environment on Linux
 
```bash
cd deploy/scripts
sh install-on-linux.sh   # install k8s cluster
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
sh install-on-mac.sh  # create vm & setup in it
``` 

3. Start laf server

```bash
# Forward service in cluster to localhost, run this command in another terminal separately
kubectl port-forward deployment/mongodb 27017:27017 -n laf-system
kubectl port-forward deployments/casdoor 30070:8000 -n laf-system

# Run these in first time or when someone change the schema.
cd server
npm install
npx prisma db push
npx prisma generate

# run dev
npm run watch
```