package api

import (
	ossv1 "github.com/labring/laf/controllers/oss/api/v1"
	baseapi "github.com/labring/laf/tests/api"
)

const userYaml = `
apiVersion: oss.laf.dev/v1
kind: User
metadata:
  name: ${name}
  namespace: ${namespace}
  labels:
    appid: ${appid}
spec:
  provider: minio
  region: ${region}
  appid: ${appid}
  password: app-minio-password
  capacity:
    storage: 2Gi
`

func CreateOssUser(namespace string, name string, appid string, region string) {
	baseapi.MustKubeApplyFromTemplate(userYaml, map[string]string{
		"namespace": namespace,
		"name":      name,
		"appid":     appid,
		"region":    region,
	})
}

func DeleteOssUser(namespace string, name string) {
	baseapi.MustKubeDeleteFromTemplate(userYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
}

func WaitForOssUserReady(namespace string, name string) {
	baseapi.MustKubeWaitForReady(namespace, "users.oss.laf.dev/"+name, "60s")
}

func WaitForOssUserDeleted(namespace string, name string) {
	baseapi.MustKubeWaitForDeleted(namespace, "users.oss.laf.dev/"+name, "60s")
}

func GetOssUser(namespace string, name string) (*ossv1.User, error) {
	gvr := ossv1.GroupVersion.WithResource("users")
	user := &ossv1.User{}
	if err := baseapi.GetObject(namespace, name, gvr, user); err != nil {
		return nil, err
	}

	return user, nil
}
