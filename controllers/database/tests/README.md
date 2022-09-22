


## Local development 

### 0. start a k8s cluster

```bash
# in laf project root path
sh scripts/start_vm.sh laf-test ~/.kube/config
```

### 1. run the database controller locally  (*Prerequisite*)
```bash
# terminal 1st
cd controllers/database/
make run
```

### 2. run all the database tests
```bash
make test
```

### *Optional* run a specific database test for debugging
```bash
# run a specific test
go test ./tests/e2e/store_create_test.go

# specify the test name
go test ./tests/e2e/db_create_test.go -run TestDbCreate -v
```


## CI/CD

### 0. prepare a remote k8s cluster
> TODO

### 1. build & push the controller image
```bash
# build the image
make docker-build

# push the image
make docker-push
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