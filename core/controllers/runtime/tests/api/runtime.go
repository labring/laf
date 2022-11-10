package api

import (
	runtimev1 "github.com/labring/laf/core/controllers/runtime/api/v1"
	baseapi "github.com/labring/laf/core/tests/api"
)

const runtimeYaml = `
apiVersion: runtime.laf.dev/v1
kind: Runtime
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  type: node:laf
  image:
    main: "docker.io/lafyun/app-service:0.8.7"
  version:
    version: 0.8.7
`

func CreateAppRuntime(namespace string, name string) {
	baseapi.MustKubeApplyFromTemplate(runtimeYaml, map[string]string{
		"namespace": namespace,
		"name":      name,
	})
}

func DeleteAppRuntime(namespace string, name string) {
	baseapi.MustKubeApplyFromTemplate(runtimeYaml, map[string]string{
		"namespace": namespace,
		"name":      name,
	})
}

func GetAppRuntime(namespace string, name string) (*runtimev1.Runtime, error) {
	gvr := runtimev1.GroupVersion.WithResource("runtimes")
	var runtime runtimev1.Runtime
	if err := baseapi.GetObject(namespace, name, gvr, &runtime); err != nil {
		return nil, err
	}
	return &runtime, nil
}
