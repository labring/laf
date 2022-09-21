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

const dbYaml = `
apiVersion: database.laf.dev/v1
kind: Database
metadata:
  name: ${appid}
  namespace: ${appid}
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

func CreateDatabase(appid string, region string) {
	yamlStr := strings.ReplaceAll(dbYaml, "${appid}", appid)
	yamlStr = strings.ReplaceAll(yamlStr, "${region}", region)
	_, err := api.KubeApply(yamlStr)
	if err != nil {
		panic(err)
	}
}

func DeleteDatabase(appid string, region string) {
	yamlStr := strings.ReplaceAll(dbYaml, "${appid}", appid)
	yamlStr = strings.ReplaceAll(yamlStr, "${region}", region)
	_, err := api.KubeDelete(yamlStr)
	if err != nil {
		panic(err)
	}

	// TODO waiting for delete

}

func GetDatabase(appid string) (*databasev1.Database, error) {
	client := api.GetDefaultDynamicClient()
	gvr := schema.GroupVersionResource{
		Group:    "database.laf.dev",
		Version:  "v1",
		Resource: "databases",
	}
	db, err := client.Resource(gvr).Namespace(appid).Get(context.TODO(), appid, metav1.GetOptions{})
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
