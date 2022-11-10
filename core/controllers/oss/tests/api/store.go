package api

import (
	ossv1 "github.com/labring/laf/core/controllers/oss/api/v1"
	baseapi "github.com/labring/laf/core/tests/api"
)

const storeYaml = `
apiVersion: oss.laf.dev/v1
kind: Store
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  provider: minio
  endpoint: ${endpoint}
  accessKey: minio-root-user
  secretKey: minio-root-password
  region: ${region}
  priority: 10
  useSSL: false
  capacity:
    storage: 10Gi
    objectCount: 10000
    userCount: 1000
    bucketCount: 2000
`

func CreateOssStore(namespace string, name string, region string, endpoint string) {
	baseapi.MustKubeApplyFromTemplate(storeYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
		"region":    region,
		"endpoint":  endpoint,
	})
}

func DeleteOssStore(namespace string, name string) {
	baseapi.MustKubeDeleteFromTemplate(storeYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
}

func WaitForOssStoreReady(namespace string, name string) {
	baseapi.MustKubeWaitForReady(namespace, "stores.oss.laf.dev/"+name, "60s")
}

func WaitForOssStoreDeleted(namespace string, name string) {
	baseapi.MustKubeWaitForDeleted(namespace, "stores.oss.laf.dev/"+name, "60s")
}

func GetOssStore(namespace string, name string) (*ossv1.Store, error) {
	gvr := ossv1.GroupVersion.WithResource("stores")
	store := &ossv1.Store{}
	if err := baseapi.GetObject(namespace, name, gvr, store); err != nil {
		return nil, err
	}

	return store, nil
}
