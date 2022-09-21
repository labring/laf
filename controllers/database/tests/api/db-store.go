package api

import (
	"laf/pkg/common"
	"laf/tests/api"
	"strings"
)

const storeYaml = `
---
apiVersion: database.laf.dev/v1
kind: Store
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  provider: mongodb
  region: ${region}
  connectionURI: mongodb://root:password123@mongo.default:27017/?authSource=admin
  capacity:
    userCount: 1000
    storage: 100Gi
    databaseCount: 1000
    collectionCount: 10000
`

func CreateDatabaseStore(name string, region string) {
	yaml_str := strings.ReplaceAll(storeYaml, "${namespace}", common.GetSystemNamespace())
	yaml_str = strings.ReplaceAll(yaml_str, "${region}", region)
	yaml_str = strings.ReplaceAll(yaml_str, "${name}", name)
	api.EnsureSystemNamespace()
	_, err := api.KubeApply(yaml_str)
	if err != nil {
		panic(err)
	}
}

func DeleteDatabaseStore(name string, region string) {
	yaml_str := strings.ReplaceAll(storeYaml, "${namespace}", common.GetSystemNamespace())
	yaml_str = strings.ReplaceAll(yaml_str, "${region}", region)
	yaml_str = strings.ReplaceAll(yaml_str, "${name}", name)
	_, err := api.KubeDelete(yaml_str)
	if err != nil {
		panic(err)
	}
}
