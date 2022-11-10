## Intro

The directory contains the code for the deploy controller.

The deploy is to be used to build a sealos cluster image which can be used to deploy controller to a kubernetes cluster.

## Usage

### Kubectl apply directly

```bash
kubectl apply -f manifests
```

## Build Sealos Image

> Usually you don't need to build a Sealos Image yourself, because we have automatically constructed the latest Sealos Image in GitHub Actions, you can use it directly.

```bash
make pre-deploy # update the manifests
sealos build -t ghcr.io/xxxx/xxxx:latest .
```