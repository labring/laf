package api

import (
	"context"
	ossv1 "github.com/labring/laf/controllers/oss/api/v1"
	baseapi "github.com/labring/laf/tests/api"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
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

func CreateOssStore(namespace string, name string, region string, endpoint string) error {
	params := map[string]string{
		"name":      name,
		"namespace": namespace,
		"region":    region,
		"endpoint":  endpoint,
	}
	_, err := baseapi.KubeApplyFromTemplate(storeYaml, params)
	return err
}

func DeleteOssStore(namespace string, name string) error {
	params := map[string]string{
		"name":      name,
		"namespace": namespace,
	}
	_, err := baseapi.KubeApplyFromTemplate(storeYaml, params)
	return err
}

func GetOssStore(namespace string, name string) (*ossv1.Store, error) {
	client := baseapi.GetDefaultDynamicClient()
	gvr := schema.GroupVersionResource{
		Group:    "oss.laf.dev",
		Version:  "v1",
		Resource: "stores",
	}

	obj, err := client.Resource(gvr).Namespace(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	store := &ossv1.Store{}
	err = runtime.DefaultUnstructuredConverter.FromUnstructured(obj.UnstructuredContent(), store)
	if err != nil {
		return nil, err
	}

	return store, nil
}
