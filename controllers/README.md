### CRD生成

```shell
kubebuilder init --domain laf.dev --project-name oss --repo github.com/labring/laf/controllers/oss
kubebuilder create api --group oss --version v1 --kind Oss

```

### CRDS 部署到集群

```shell
# 在执行make install 报错时候可改用下列命令
make manifests
kustomize build config/crd | kubectl apply -f -
```