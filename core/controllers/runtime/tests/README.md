# Runtime tests

## How to use

### install crds and run controller

```shell
cd controllers/database && make install
cd controllers/runtime && make install
go main.go
```

### run test

```shell
cd controllers/runtime
go test tests/e2e/function.go
```
