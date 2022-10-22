package api

import (
	appv1 "github.com/labring/laf/controllers/application/api/v1"
	baseapi "github.com/labring/laf/tests/api"
)

const appYaml = `
apiVersion: application.laf.dev/v1
kind: Application
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  appid: ${appid}
  state: Running
  region: ${region}
  bundleName: ${bundleName}
  runtimeName: ${runtimeName}
`

func CreateApplication(namespace, name, appid, bundleName, runtimeName, region string) {
	baseapi.MustKubeApplyFromTemplate(appYaml, map[string]string{
		"namespace":   namespace,
		"name":        name,
		"appid":       appid,
		"bundleName":  bundleName,
		"runtimeName": runtimeName,
		"region":      region,
	})
}

func DeleteApplication(namespace, name string) {
	baseapi.MustKubeDeleteFromTemplate(appYaml, map[string]string{
		"namespace": namespace,
		"name":      name,
	})
}

func WaitForApplicationReady(namespace, name string) {
	baseapi.MustKubeWaitForReady(namespace, "applications.application.laf.dev/"+name, "120s")
}

func WaitForApplicationDeleted(namespace, name string) {
	baseapi.MustKubeWaitForDeleted(namespace, "applications.application.laf.dev/"+name, "120s")
}

func GetApplication(namespace, name string) (*appv1.Application, error) {
	gvr := appv1.GroupVersion.WithResource("applications")
	app := &appv1.Application{}
	if err := baseapi.GetObject(namespace, name, gvr, app); err != nil {
		return nil, err
	}
	return app, nil
}
