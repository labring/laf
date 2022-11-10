package api

import (
	instancev1 "github/labring/laf/core/controllers/instance/api/v1"

	baseapi "github.com/labring/laf/core/tests/api"
)

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
      main: "nginx"
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

func StopInstance(namespace, name, region, appId, state string) {
	baseapi.MustKubeApplyFromTemplate(yaml, map[string]string{
		"name":      name,
		"namespace": namespace,
		"region":    region,
		"appId":     appId,
		"state":     state,
	})
}

func GetInstance(namespace, name string) (*instancev1.Instance, error) {
	gvr := instancev1.GroupVersion.WithResource("instances")
	var instance instancev1.Instance
	if err := baseapi.GetObject(namespace, name, gvr, &instance); err != nil {
		return nil, err
	}
	return &instance, nil
}

func WaitForInstanceReady(namespace string, name string) {
	baseapi.MustKubeWaitForReady(namespace, "instances.instance.laf.dev/"+name, "120s")
}

func DeleteInstance(namespace, name string) {
	baseapi.MustKubeDeleteFromTemplate(yaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
}
