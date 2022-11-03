


## Prerequisites

```shell
sealos run ghcr.io/labring/laf-casdoor:dev -f
```

## Install

```shell
export NODE_IP=$(kubectl get nodes -o jsonpath="{.items[0].status.addresses[0].address}")

helm install service-auth \
  --set image.tag=dev \
  --set config.callbackUrl=http://localhost:8080/login/callback \
  --set config.ssoEndpoint=http://$NODE_IP:30800 \
  --namespace sealos \
  .
  # end of script
```

## Uninstall

```shell
helm uninstall service-auth -n sealos
```
