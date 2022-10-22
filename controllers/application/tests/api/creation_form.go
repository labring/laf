package api

import (
	"fmt"
	appv1 "github.com/labring/laf/controllers/application/api/v1"
	baseapi "github.com/labring/laf/tests/api"
)

const formYaml = `
apiVersion: application.laf.dev/v1
kind: CreationForm
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  displayName: "Sample Application Name"
  region: ${region}
  bundleName: ${bundle}
  runtimeName: ${runtime}
`

func AddCreationForm(namespace string, name string, bundleName string, runtimeName string, region string) {
	baseapi.MustKubeApplyFromTemplate(formYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
		"bundle":    bundleName,
		"runtime":   runtimeName,
		"region":    region,
	})
}

func WaitForCreationFormReady(namespace string, name string) {
	groupResource := fmt.Sprintf("creationforms.%s/%s", appv1.GroupVersion.Group, name)
	baseapi.MustKubeWaitForCondition(namespace, groupResource, "Created", "60s")
}

func DeleteCreationForm(namespace string, name string) {
	baseapi.MustKubeDeleteFromTemplate(formYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
}

func WaitForCreationFormDeleted(namespace string, name string) {
	groupResource := fmt.Sprintf("creationforms.%s/%s", appv1.GroupVersion.Group, name)
	baseapi.MustKubeWaitForDeleted(namespace, groupResource, "60s")
}

func GetCreationForm(namespace string, name string) (*appv1.CreationForm, error) {
	gvr := appv1.GroupVersion.WithResource("creationforms")
	form := &appv1.CreationForm{}
	if err := baseapi.GetObject(namespace, name, gvr, form); err != nil {
		return nil, err
	}

	return form, nil
}
