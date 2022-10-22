package api

import baseapi "github.com/labring/laf/tests/api"

const yaml = `
apiVersion: instance.laf.dev/v1
kind: Instance
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  region: ${region}
  appid: ${appId}
  state: ${state}
  bundle: 
    displayName: "Standard"
    requestCPU: "500m"
    requestMemory: "128Mi"
    limitCPU: "1000m"
    limitMemory: "256Mi"
    databaseCapacity: "1Gi"
    storageCapacity: "1Gi"
    networkTrafficOutbound: "1Gi"
    priority: 10
  runtime:
    type: node:laf
    image:
      main: "docker.io/lafyun/app-service:0.8.7"
    version:
      version: 0.8.7
`

func CreateInstance(namespace, name, region, appId, state string) {
	baseapi.MustKubeApplyFromTemplate(yaml, map[string]string{
		"name":      name,
		"namespace": namespace,
		"region":    region,
		"appId":     appId,
		"state":     state,
	})
}
