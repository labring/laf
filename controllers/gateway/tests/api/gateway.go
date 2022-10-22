package api

import (
	"fmt"
	testapi "github.com/labring/laf/tests/api"
	"github.com/labring/laf/tests/util"
)

const systemNamespace = "testing-system"
const testNamespace = "testing"

const gatewayYaml = `
apiVersion: gateway.laf.dev/v1
kind: Gateway
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
spec:
  appid: {{ .appId }}
`

// CreateGateway create a gateway
func CreateGateway(name, namespace, appId string) {
	template, err := util.RenderTemplate(gatewayYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
		"appId":     appId,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeApply(template)
	if err != nil {
		panic(err)
	}
}

const gatewayBucketYaml = `
apiVersion: gateway.laf.dev/v1
kind: Gateway
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
spec:
  appid: testing
  buckets: ["{{ .bucketName }}"]
`

// AddGatewayBucket add gateway bucket
func AddGatewayBucket(name, namespace, appId, bucketName string) {
	template, err := util.RenderTemplate(gatewayBucketYaml, map[string]string{
		"name":       name,
		"namespace":  namespace,
		"appId":      appId,
		"bucketName": bucketName,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeApply(template)
	if err != nil {
		panic(err)
	}
}

// DeleteGatewayBucket delete gateway bucket
func DeleteGatewayBucket(name, namespace, appId string) {
	template, err := util.RenderTemplate(gatewayYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
		"appId":     appId,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeApply(template)
	if err != nil {
		panic(err)
	}
}

// DeleteGateway delete gateway
func DeleteGateway(name, namespace, appId string) {
	template, err := util.RenderTemplate(gatewayYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
		"appId":     appId,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeDelete(template)
	if err != nil {
		panic(err)
	}
}

func WaitForGatewayReady(name string, namespace string) {
	cmd := fmt.Sprintf("kubectl wait --for=condition=ready --timeout=60s gateways.gateway.laf.dev/%s -n %s", name, namespace)
	_, err := testapi.Exec(cmd)
	if err != nil {
		panic(err)
	}
}
