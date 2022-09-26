package api

import (
	v1 "github.com/labring/laf/controllers/application/api/v1"
	baseapi "github.com/labring/laf/tests/api"
)

const bundleYaml = `
apiVersion: application.laf.dev/v1
kind: Bundle
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  displayName: "Standard"
  requestCPU: "500m"
  requestMemory: "128Mi"
  limitCPU: "1000m"
  limitMemory: "256Mi"
  databaseCapacity: "1Gi"
  storageCapacity: "1Gi"
  networkTrafficOutbound: "1Gi"
  priority: 10

`

func CreateAppBundle(namespace string, name string) {
	baseapi.MustKubeApplyFromTemplate(bundleYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})

}

func DeleteAppBundle(namespace string, name string) {
	baseapi.MustKubeDeleteFromTemplate(bundleYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
}

func GetAppBundle(namespace string, name string) (*v1.Bundle, error) {
	gvr := v1.GroupVersion.WithResource("bundles")
	bundle := &v1.Bundle{}
	if err := baseapi.GetObject(namespace, name, gvr, bundle); err != nil {
		return nil, err
	}

	return bundle, nil
}
