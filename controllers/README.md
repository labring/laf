### CRD生成
```shell
kubebuilder init --domain laf.dev --project-name oss --repo github.com/labring/laf/controllers/oss
kubebuilder create api --group oss --version v1 --kind Oss

```