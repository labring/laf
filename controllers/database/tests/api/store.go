package api

import (
	"context"
	databasev1 "github.com/labring/laf/controllers/database/api/v1"
	baseapi "github.com/labring/laf/tests/api"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
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
  connectionUri: ${connectionUri}
  capacity:
    userCount: 1000
    storage: 100Gi
    databaseCount: 1000
    collectionCount: 10000
`

func CreateDatabaseStore(namespace string, name string, region string, connectionUri string) {
	baseapi.MustKubeApplyFromTemplate(storeYaml, map[string]string{
		"namespace":     namespace,
		"name":          name,
		"region":        region,
		"connectionUri": connectionUri,
	})
}

func DeleteDatabaseStore(namespace string, name string) {
	baseapi.MustKubeDeleteFromTemplate(storeYaml, map[string]string{
		"namespace": namespace,
		"name":      name,
	})
}

func WaitForDatabaseStoreReady(namespace string, name string) {
	baseapi.MustKubeWaitForReady(namespace, "stores.database.laf.dev/"+name, "60s")
}

func WaitForDatabaseStoreDeleted(namespace string, name string) {
	baseapi.MustKubeWaitForDeleted(namespace, "stores.database.laf.dev/"+name, "60s")
}

func GetDatabaseStore(namespace string, name string) (*databasev1.Store, error) {
	gvr := databasev1.GroupVersion.WithResource("stores")
	var store databasev1.Store
	if err := baseapi.GetObject(namespace, name, gvr, &store); err != nil {
		return nil, err
	}

	return &store, nil
}

// UpdateDatabaseStoreStatus is to demonstrate how to update status of an resource object.
func UpdateDatabaseStoreStatus(namespace string, name string, status databasev1.StoreStatus) {
	client := baseapi.GetDefaultDynamicClient()
	gvr := databasev1.GroupVersion.WithResource("stores")

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
