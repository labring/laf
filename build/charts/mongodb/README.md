## Install

```shell
helm install mongodb \
  --set db.username=admin \
  --set db.password=passw0rd \
  --namespace mongodb \
  .
  # end of script
```

## Uninstall

```shell
helm uninstall mongodb -n mongodb
```
