


## Prerequisites

```shell
kubectl create namespace laf
```


## Install
helm install casdoor -n test . --set service.nodePort=30071

```shell
helm install casdoor \
  --namespace laf \
  .
```

## Uninstall

```shell
helm delete casdoor -n laf
```
