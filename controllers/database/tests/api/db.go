package api

import (
	"laf/tests/api"
	"strings"
)

const db_yaml = `
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
  password: password123password123
  capacity:
    storage: 1Gi
`

func CreateDatabase(appid string, region string) {
	yaml_str := strings.ReplaceAll(db_yaml, "${appid}", appid)
	yaml_str = strings.ReplaceAll(yaml_str, "${region}", region)
	_, err := api.KubeApply(yaml_str)
	if err != nil {
		panic(err)
	}
}

func DeleteDatabase(appid string, region string) {
	yaml_str := strings.ReplaceAll(db_yaml, "${appid}", appid)
	yaml_str = strings.ReplaceAll(yaml_str, "${region}", region)
	_, err := api.KubeDelete(yaml_str)
	if err != nil {
		panic(err)
	}
}
