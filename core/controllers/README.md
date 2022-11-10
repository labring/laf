### Create a new CRD project

```shell
# in ./controllers/
mkdir mycrd
kubebuilder init --domain laf.dev --project-name mycrd --repo github.com/labring/laf/core/controllers/mycrd

# (Required) install the dependencies before creating api
go get

kubebuilder create api --group mycrd --version v1 --kind Mycrd

```

### Deploy it to the cluster

```shell
# You can use the following commands instead when you execute `make install` errors
make manifests
kustomize build config/crd | kubectl apply -f -
```
