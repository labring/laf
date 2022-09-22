package api

import (
	"context"
	databasev1 "github.com/labring/laf/controllers/database/api/v1"
	baseapi "github.com/labring/laf/tests/api"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
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
  connectionUri: ${connectionURI}
  capacity:
    userCount: 1000
    storage: 100Gi
    databaseCount: 1000
    collectionCount: 10000
`

func CreateDatabaseStore(namespace string, name string, region string, connectionURI string) {
	yamlStr := strings.ReplaceAll(storeYaml, "${namespace}", namespace)
	yamlStr = strings.ReplaceAll(yamlStr, "${region}", region)
	yamlStr = strings.ReplaceAll(yamlStr, "${name}", name)
	yamlStr = strings.ReplaceAll(yamlStr, "${connectionURI}", connectionURI)
	_, err := baseapi.KubeApply(yamlStr)
	if err != nil {
		panic(err)
	}
}

func DeleteDatabaseStore(namespace string, name string, region string) {
	yamlStr := strings.ReplaceAll(storeYaml, "${namespace}", namespace)
	yamlStr = strings.ReplaceAll(yamlStr, "${region}", region)
	yamlStr = strings.ReplaceAll(yamlStr, "${name}", name)
	_, err := baseapi.KubeDelete(yamlStr)
	if err != nil {
		panic(err)
	}
}

func GetDatabaseStore(namespace string, name string) (*databasev1.Store, error) {
	client := baseapi.GetDefaultDynamicClient()
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

func UpdateDatabaseStoreStatus(namespace string, name string, status databasev1.StoreStatus) {
	client := baseapi.GetDefaultDynamicClient()
	gvr := schema.GroupVersionResource{
		Group:    "database.laf.dev",
		Version:  "v1",
		Resource: "stores",
	}
	store, err := client.Resource(gvr).Namespace(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		panic(err)
	}

	var storeObj databasev1.Store
	err = runtime.DefaultUnstructuredConverter.FromUnstructured(store.Object, &storeObj)
	if err != nil {
		panic(err)
	}

	storeObj.Status = status
	store.Object, err = runtime.DefaultUnstructuredConverter.ToUnstructured(&storeObj)
	if err != nil {
		panic(err)
	}

	_, err = client.Resource(gvr).Namespace(namespace).UpdateStatus(context.TODO(), store, metav1.UpdateOptions{})
	if err != nil {
		panic(err)
	}
}
