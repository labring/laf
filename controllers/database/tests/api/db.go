package api

import (
	databasev1 "github.com/labring/laf/controllers/database/api/v1"
	baseapi "github.com/labring/laf/tests/api"
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
	baseapi.MustKubeApplyFromTemplate(dbYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
		"appid":     appid,
		"region":    region,
	})
}

func DeleteDatabase(namespace string, name string) {
	baseapi.MustKubeDeleteFromTemplate(dbYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
}

func WaitForDatabaseReady(namespace string, name string) {
	baseapi.MustKubeWaitForReady(namespace, "databases.database.laf.dev/"+name, "60s")
}

func WaitForDatabaseDeleted(namespace string, name string) {
	baseapi.MustKubeWaitForDeleted(namespace, "databases.database.laf.dev/"+name, "60s")
}

func GetDatabase(namespace string, name string) (*databasev1.Database, error) {
	gvr := databasev1.GroupVersion.WithResource("databases")
	var db databasev1.Database
	if err := baseapi.GetObject(namespace, name, gvr, &db); err != nil {
		return nil, err
	}
	return &db, nil
}
