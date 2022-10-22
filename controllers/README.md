### Create a new CRD project

```shell
fd# in ./controllers/
mkdir mycrd
kubebuilder init --domain laf.dev --project-name mycrd --repo github.com/labring/laf/controllers/mycrd

# (Required) install the dependencies before creating api
go get

kubebuilder create api --group mycrd --version v1 --kind Mycrd

```

### Deploy it to the cluster

```shell
# 在执行make install 报错时候可改用下列命令
make manifests
kustomize build config/crd | kubectl apply -f -
```
