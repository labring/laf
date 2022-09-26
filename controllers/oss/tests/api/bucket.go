package api

import (
	ossv1 "github.com/labring/laf/controllers/oss/api/v1"
	baseapi "github.com/labring/laf/tests/api"
)

const bucketYaml = `
apiVersion: oss.laf.dev/v1
kind: Bucket
metadata:
  name: ${name}
  namespace: ${namespace}
  labels:
    appid: ${appid}
spec:
  policy: ${policy}
  storage: 100Mi
`

func CreateOssBucket(namespace string, name string, appid string) {
	baseapi.MustKubeApplyFromTemplate(bucketYaml, map[string]string{
		"namespace": namespace,
		"name":      name,
		"appid":     appid,
		"policy":    "readonly",
	})
}

func DeleteOssBucket(namespace string, name string) {
	baseapi.MustKubeDeleteFromTemplate(bucketYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
}

func WaitForOssBucketReady(namespace string, name string) {
	baseapi.MustKubeWaitForReady(namespace, "buckets.oss.laf.dev/"+name, "60s")
}

func WaitForOssBucketDeleted(namespace string, name string) {
	baseapi.MustKubeWaitForDeleted(namespace, "buckets.oss.laf.dev/"+name, "60s")
}

func GetOssBucket(namespace string, name string) (*ossv1.Bucket, error) {
	gvr := ossv1.GroupVersion.WithResource("buckets")
	bucket := &ossv1.Bucket{}
	if err := baseapi.GetObject(namespace, name, gvr, bucket); err != nil {
		return nil, err
	}
	return bucket, nil
}
