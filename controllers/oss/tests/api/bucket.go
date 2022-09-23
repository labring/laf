package api

import (
	"context"
	"fmt"
	ossv1 "github.com/labring/laf/controllers/oss/api/v1"
	baseapi "github.com/labring/laf/tests/api"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
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
	params := map[string]string{
		"namespace": namespace,
		"name":      name,
		"appid":     appid,
		"policy":    "readonly",
	}

	_, err := baseapi.KubeApplyFromTemplate(bucketYaml, params)
	if err != nil {
		panic(err)
	}
}

func WaitForOssBucketReady(namespace string, name string) {
	cmd := fmt.Sprintf("kubectl wait --for=condition=ready --timeout=60s buckets.oss.laf.dev/%s -n %s", name, namespace)
	_, err := baseapi.Exec(cmd)
	if err != nil {
		panic(err)
	}
}

func DeleteOssBucket(namespace string, name string) {
	params := map[string]string{
		"name":      name,
		"namespace": namespace,
	}

	_, err := baseapi.KubeDeleteFromTemplate(bucketYaml, params)
	if err != nil {
		panic(err)
	}
}

func WaitForOssBucketDeleted(namespace string, name string) {
	cmd := fmt.Sprintf("kubectl wait --for=delete --timeout=60s buckets.oss.laf.dev/%s -n %s", name, namespace)
	_, err := baseapi.Exec(cmd)
	if err != nil {
		panic(err)
	}
}

func GetOssBucket(namespace string, name string) (*ossv1.Bucket, error) {
	client := baseapi.GetDefaultDynamicClient()
	gvr := schema.GroupVersionResource{
		Group:    ossv1.GroupVersion.Group,
		Version:  ossv1.GroupVersion.Version,
		Resource: "buckets",
	}

	obj, err := client.Resource(gvr).Namespace(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	bucket := &ossv1.Bucket{}
	err = runtime.DefaultUnstructuredConverter.FromUnstructured(obj.Object, bucket)
	if err != nil {
		return nil, err
	}

	return bucket, nil
}
