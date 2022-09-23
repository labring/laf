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
	params := map[string]string{
		"namespace": namespace,
		"name":      name,
		"appid":     appid,
		"region":    region,
	}

	_, err := baseapi.KubeApplyFromTemplate(userYaml, params)
	if err != nil {
		panic(err)
	}
}

func WaitForOssUserReady(namespace string, name string) {
	cmd := fmt.Sprintf("kubectl wait --for=condition=ready --timeout=60s users.oss.laf.dev/%s -n %s", name, namespace)
	_, err := baseapi.Exec(cmd)
	if err != nil {
		panic(err)
	}
}

func DeleteOssUser(namespace string, name string) {
	params := map[string]string{
		"name":      name,
		"namespace": namespace,
	}

	_, err := baseapi.KubeDeleteFromTemplate(userYaml, params)
	if err != nil {
		panic(err)
	}
}

func WaitForOssUserDeleted(namespace string, name string) {
	cmd := fmt.Sprintf("kubectl wait --for=delete --timeout=60s users.oss.laf.dev/%s -n %s", name, namespace)
	_, err := baseapi.Exec(cmd)
	if err != nil {
		panic(err)
	}
}

func GetOssUser(namespace string, name string) (*ossv1.User, error) {
	client := baseapi.GetDefaultDynamicClient()
	gvr := schema.GroupVersionResource{
		Group:    ossv1.GroupVersion.Group,
		Version:  ossv1.GroupVersion.Version,
		Resource: "users",
	}

	obj, err := client.Resource(gvr).Namespace(namespace).Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	user := &ossv1.User{}
	err = runtime.DefaultUnstructuredConverter.FromUnstructured(obj.Object, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}
