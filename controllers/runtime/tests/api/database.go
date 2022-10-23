package api

import (
	testapi "github.com/labring/laf/tests/api"
	"github.com/labring/laf/tests/util"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

const databaseYaml = `
apiVersion: database.laf.dev/v1
kind: Database
metadata:
  name: mongodb
  namespace: {{ .namespace }}
spec:
  provider: mongodb
  region: default
  username: appid-1
  password: password123password123
  capacity:
    storage: 1Gi
`

const databaseStatusYaml = `
connectionUri: 'mongodb://root:password123@127.0.0.1:27017'
`

func CreateDatabase(namespace string) {
	template, err := util.RenderTemplate(databaseYaml, map[string]string{
		"namespace": namespace,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeApply(template)
	if err != nil {
		panic(err)
	}

	updateDatabaseStatus("mongodb", namespace)
}

func updateDatabaseStatus(name, namespace string) {
	gvr := schema.GroupVersionResource{
		Group:    "database.laf.dev",
		Version:  "v1",
		Resource: "databases",
	}
	err := testapi.KubeUpdateStatus(name, namespace, databaseStatusYaml, gvr)
	if err != nil {
		panic(err)
	}
}
