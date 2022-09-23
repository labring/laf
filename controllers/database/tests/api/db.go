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

const dbYaml = `
apiVersion: database.laf.dev/v1
kind: Database
metadata:
  name: ${name}
  namespace: ${namespace}
  labels:
    appid: ${appid}
spec:
  provider: mongodb
  username: ${appid}
  region: ${region}
  password: password123password123
  capacity:
    storage: 1Gi
`

func CreateDatabase(namespace string, name string, appid string, region string) {
	params := map[string]string{
		"name":      name,
		"namespace": namespace,
		"appid":     appid,
		"region":    region,
	}
	_, err := baseapi.KubeApplyFromTemplate(dbYaml, params)
	if err != nil {
		panic(err)
	}
}

func DeleteDatabase(namespace string, name string) {
	params := map[string]string{
		"name":      name,
		"namespace": namespace,
	}
	_, err := baseapi.KubeDeleteFromTemplate(dbYaml, params)
	if err != nil {
		panic(err)
	}
}

func WaitForDatabaseReady(namespace string, name string) {
	cmd := fmt.Sprintf("kubectl wait --for=condition=ready --timeout=60s databases.database.laf.dev/%s -n %s", name, namespace)
	_, err := baseapi.Exec(cmd)
	if err != nil {
		panic(err)
	}
}

func WaitForDatabaseDeleted(namespace string, name string) {
	cmd := fmt.Sprintf("kubectl wait --for=delete --timeout=60s databases.database.laf.dev/%s -n %s", name, namespace)
	_, err := baseapi.Exec(cmd)
	if err != nil {
		panic(err)
	}
}

func GetDatabase(namespace string, name string) (*databasev1.Database, error) {
	client := baseapi.GetDefaultDynamicClient()
	gvr := schema.GroupVersionResource{
		Group:    databasev1.GroupVersion.Group,
		Version:  databasev1.GroupVersion.Version,
		Resource: "databases",
	}
	db, err := client.Resource(gvr).Namespace(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	var dbObj databasev1.Database
	err = runtime.DefaultUnstructuredConverter.FromUnstructured(db.Object, &dbObj)
	if err != nil {
		return nil, err
	}

	return &dbObj, nil
}
