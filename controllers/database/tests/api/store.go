package api

import (
	"context"
	"fmt"
	databasev1 "github.com/labring/laf/controllers/database/api/v1"
	baseapi "github.com/labring/laf/tests/api"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
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
	params := map[string]string{
		"namespace":     namespace,
		"name":          name,
		"region":        region,
		"connectionURI": connectionURI,
	}
	_, err := baseapi.KubeApplyFromTemplate(storeYaml, params)
	if err != nil {
		panic(err)
	}
}

func DeleteDatabaseStore(namespace string, name string) {
	params := map[string]string{
		"namespace": namespace,
		"name":      name,
	}
	_, err := baseapi.KubeDeleteFromTemplate(storeYaml, params)
	if err != nil {
		panic(err)
	}
}

func WaitForDatabaseStoreReady(namespace string, name string) {
	cmd := fmt.Sprintf("kubectl wait --for=condition=Ready --timeout=60s stores.database.laf.dev/%s -n %s", name, namespace)
	_, err := baseapi.Exec(cmd)
	if err != nil {
		panic(err)
	}
}

func WaitForDatabaseStoreDeleted(namespace string, name string) {
	cmd := fmt.Sprintf("kubectl wait --for=delete --timeout=60s stores.database.laf.dev/%s -n %s", name, namespace)
	_, err := baseapi.Exec(cmd)
	if err != nil {
		panic(err)
	}
}

func GetDatabaseStore(namespace string, name string) (*databasev1.Store, error) {
	client := baseapi.GetDefaultDynamicClient()
	gvr := schema.GroupVersionResource{
		Group:    databasev1.GroupVersion.Group,
		Version:  databasev1.GroupVersion.Version,
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

// UpdateDatabaseStoreStatus is to demonstrate how to update status of an resource object.
func UpdateDatabaseStoreStatus(namespace string, name string, status databasev1.StoreStatus) {
	client := baseapi.GetDefaultDynamicClient()
	gvr := schema.GroupVersionResource{
		Group:    databasev1.GroupVersion.Group,
		Version:  databasev1.GroupVersion.Version,
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
