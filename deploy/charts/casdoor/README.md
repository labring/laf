


## Prerequisites

```shell
kubectl create namespace sealos
```


## Install

```shell
helm install casdoor \
  --namespace sealos \
  .
```

## Uninstall

```shell
helm delete casdoor -n sealos
```
