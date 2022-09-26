package api

import (
	testapi "github.com/labring/laf/tests/api"
	"github.com/labring/laf/tests/util"
)

const appDomainYaml = `
apiVersion: gateway.laf.dev/v1
kind: Domain
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
spec:
  backendType: app
  cluster:
    key: edd1c9f034335f136f87ad84b625c8f1
    url: http://localhost:19180/apisix/admin
  domain: app.laf.win
  region: default
`

func createAppDomain(name, namespace string) {
	template, err := util.RenderTemplate(appDomainYaml, map[string]string{
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

const bucketDomainYaml = `
apiVersion: gateway.laf.dev/v1
kind: Domain
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
spec:
  backendType: bucket
  cluster:
    key: edd1c9f034335f136f87ad84b625c8f1
    url: http://localhost:19180/apisix/admin
  domain: oss.laf.win
  region: default

`

func createBucketDomain(name, namespace string) {
	template, err := util.RenderTemplate(bucketDomainYaml, map[string]string{
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

func CreateDomain(name, namespace string) {
	createAppDomain(name+"-app", namespace)
	createBucketDomain(name+"-bucket", namespace)
}
