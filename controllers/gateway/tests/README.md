# Gateway tests

## How to use

TODO: Install apisix in test code

### install apisix and forward port

```shell
helm repo add apisix https://charts.apiseven.com
helm repo update
helm install apisix apisix/apisix --create-namespace  --namespace apisix
kubectl port-forward service/apisix-gateway  19180:9180 -n apisix
```

### install crds and run controller

```shell
cd controllers/oss && make install
cd controllers/gateway && make install
go main.go
```

### run test

```shell
cd controllers/gateway
go test tests/e2e/gateway_test.go

```

### uninstall apisix

```
helm uninstall apisix -n apisix
```



