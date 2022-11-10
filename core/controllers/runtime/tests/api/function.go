package api

import (
	"context"

	"github.com/labring/laf/core/controllers/runtime/dbm"
	testapi "github.com/labring/laf/core/tests/api"
	"github.com/labring/laf/core/tests/util"
)

const functionYaml = `
apiVersion: runtime.laf.dev/v1
kind: Function
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
spec:
  description: "Login & Register"
  websocket: true
  methods:
    - GET
    - POST
  source:
    codes: "console.log('hi, laf')"
    version: 0
`

func CreateFunction(name, namespace string) {
	template, err := util.RenderTemplate(functionYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeApply(template)
	if err != nil {
		panic(err)
	}
}

func CheckCreateFunction(connectionUri, name string) {
	fm, err := dbm.NewFunctionManager(context.TODO(), connectionUri, "mongodb")
	if err != nil {
		panic(err)
	}
	functionData, err := fm.Get(name)
	if err != nil {
		panic(err)
	}
	if functionData == nil {
		panic("function not found")
	}
}

func DeleteFunction(name, namespace string) {
	template, err := util.RenderTemplate(functionYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeDelete(template)
	if err != nil {
		panic(err)
	}
}

func CheckDeleteFunction(connectionUri, name string) {
	fm, err := dbm.NewFunctionManager(context.TODO(), connectionUri, "mongodb")
	if err != nil {
		panic(err)
	}
	functionData, err := fm.Get(name)
	if err != nil {
		panic(err)
	}
	if functionData != nil {
		panic("function not deleted")
	}

}
