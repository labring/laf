


## Prerequisites

```shell
kubectl create namespace laf
```


## Install
```shell
helm install casdoor \
  --namespace laf \
  .
```

## Uninstall

```shell
helm delete casdoor -n laf
```
