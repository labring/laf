package api

import (
	"context"
	databasev1 "github.com/labring/laf/controllers/database/api/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
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
  connectionURI: mongodb://root:password123@${hostname}/?authSource=admin&directConnection=true
  capacity:
    userCount: 1000
    storage: 100Gi
    databaseCount: 1000
    collectionCount: 10000
`

func CreateDatabaseStore(namespace string, name string, region string, hostname string) {
	yamlStr := strings.ReplaceAll(storeYaml, "${namespace}", namespace)
	yamlStr = strings.ReplaceAll(yamlStr, "${region}", region)
	yamlStr = strings.ReplaceAll(yamlStr, "${name}", name)
	yamlStr = strings.ReplaceAll(yamlStr, "${hostname}", hostname)
	_, err := api.KubeApply(yamlStr)
	if err != nil {
		panic(err)
	}
}

func DeleteDatabaseStore(namespace string, name string, region string) {
	yamlStr := strings.ReplaceAll(storeYaml, "${namespace}", namespace)
	yamlStr = strings.ReplaceAll(yamlStr, "${region}", region)
	yamlStr = strings.ReplaceAll(yamlStr, "${name}", name)
	_, err := api.KubeDelete(yamlStr)
	if err != nil {
		panic(err)
	}
}

func GetDatabaseStore(namespace string, name string) (*databasev1.Store, error) {
	client := api.GetDefaultDynamicClient()
	gvr := schema.GroupVersionResource{
		Group:    "database.laf.dev",
		Version:  "v1",
		Resource: "stores",
	}
	store, err := client.Resource(gvr).Namespace(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	var storeObj databasev1.Store
	err = runtime.DefaultUnstructuredConverter.FromUnstructured(store.Object, &storeObj)
	if err != nil {
		return nil, err
	}

	return &storeObj, nil
}
