


## Local development

### 0. start a k8s cluster

```bash
# in laf project root path
sh scripts/start_vm.sh laf-test ~/.kube/config
```

### 1. run the controller locally  (*Prerequisite*)
```bash
# terminal 1st
cd controllers/application/
make run
```

### 2. run all the  tests
```bash
make test -v
```

### *Optional* run a specific test for debugging
```bash
# run a specific test
go test ./tests/e2e/app_create_test.go -v
```


## CI/CD

### 0. prepare a remote k8s cluster
> TODO: ensure a ready k8s cluster config is located in ~/.kube/config

### 1. build & push the controller image
```bash
# build the image
IMG=ghcr.io/oss-controller:ci-test make docker-build

# push the image
IMG=ghcr.io/oss-controller:ci-test make docker-push
```

### 2. deploy the crd
```bash
# deploy the controller
kubectl apply -f config/crd/bases
kubectl apply -f config/rbac
kubectl apply -f config/manager
```

### 3. run tests in local
```bash
make test
```