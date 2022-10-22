package api

import (
	testapi "github.com/labring/laf/tests/api"
	"github.com/labring/laf/tests/util"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

const storeYaml = `
apiVersion: oss.laf.dev/v1
kind: Store
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
spec:
  accessKey: minio-root-user
  capacity:
    bucketCount: 2000
    objectCount: 10000
    storage: 10Gi
    userCount: 1000
  endpoint: localhost:9000
  priority: 10
  provider: minio
  region: default
  secretKey: minio-root-password
  useSSL: false
status:
  capacity:
    bucketCount: 1
    objectCount: 0
    storage: '0'
  state: Enabled
`

const storeStatusYaml = `
  capacity:
    bucketCount: 2
    objectCount: 0
    storage: '0'
  state: Enabled
`

func createStore(name, namespace string) {
	template, err := util.RenderTemplate(storeYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeApply(template)
	if err != nil {
		panic(err)
	}
}

func updateStoreStatus(name, namespace string) {
	gvr := schema.GroupVersionResource{
		Group:    "oss.laf.dev",
		Version:  "v1",
		Resource: "stores",
	}
	err := testapi.KubeUpdateStatus(name, namespace, storeStatusYaml, gvr)
	if err != nil {
		panic(err)
	}
}

func deleteStore(name, namespace string) {
	template, err := util.RenderTemplate(storeYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeDelete(template)
	if err != nil {
		panic(err)
	}
}

const userYaml = `
apiVersion: oss.laf.dev/v1
kind: User
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
spec:
  appid: app1
  capacity:
    bucketCount: 0
    objectCount: 0
    storage: 2Gi
  password: app1-minio-password
  provider: minio
  
status:
  accessKey: app1
  capacity:
    bucketCount: 0
    objectCount: 0
    storage: '0'
  endpoint: localhost:9000
  region: default
  secretKey: app1-minio-password
  storeName: store-sample
  storeNamespace: default

`

const userStatusYaml = `
  accessKey: app1
  capacity:
    bucketCount: 0
    objectCount: 0
    storage: '0'
  endpoint: localhost:9000
  region: default
  secretKey: app1-minio-password
  storeName: store-sample
  storeNamespace: {{ .systemNamespace }}
`

func createUser(name, namespace string) {
	template, err := util.RenderTemplate(userYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeApply(template)
	if err != nil {
		panic(err)
	}
}

func updateUserStatus(name, namespace, systemNamespace string) {
	gvr := schema.GroupVersionResource{
		Group:    "oss.laf.dev",
		Version:  "v1",
		Resource: "users",
	}
	template, err := util.RenderTemplate(userStatusYaml, map[string]string{
		"systemNamespace": systemNamespace,
	})
	if err != nil {
		panic(err)
	}
	err = testapi.KubeUpdateStatus(name, namespace, template, gvr)
	if err != nil {
		panic(err)
	}
}

func deleteUser(name, namespace string) {
	template, err := util.RenderTemplate(userYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeDelete(template)
	if err != nil {
		panic(err)
	}
}

const bucketYaml = `
apiVersion: oss.laf.dev/v1
kind: Bucket
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
status:
  capacity:
    maxStorage: 100Mi
    objectCount: 0
    storage: '0'
  policy: readonly
  user: app1
  versioning: true
spec:
  policy: readonly
  storage: 100Mi
`

const bucketStatusYaml = `
  capacity:
    maxStorage: 100Mi
    objectCount: 0
    storage: '0'
  policy: readonly
  user: app1
  versioning: true
`

func createBucket(name, namespace string) {
	template, err := util.RenderTemplate(bucketYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})

	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeApply(template)
	if err != nil {
		panic(err)
	}
}

func updateBucketStatus(name, namespace string) {
	gvr := schema.GroupVersionResource{
		Group:    "oss.laf.dev",
		Version:  "v1",
		Resource: "buckets",
	}
	err := testapi.KubeUpdateStatus(name, namespace, bucketStatusYaml, gvr)
	if err != nil {
		panic(err)
	}
}

func deleteBucket(name, namespace string) {
	template, err := util.RenderTemplate(bucketYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
	if err != nil {
		panic(err)
	}
	_, err = testapi.KubeDelete(template)
	if err != nil {
		panic(err)
	}
}

func CreateOssResource(namespace, systemNamespace string) {
	createStore("store-sample", systemNamespace)
	updateStoreStatus("store-sample", systemNamespace)
	createUser("app1", namespace)
	updateUserStatus("app1", namespace, systemNamespace)
	createBucket("app1-sample1", namespace)
	updateBucketStatus("app1-sample1", namespace)
	createBucket("app1-sample2", namespace)
	updateBucketStatus("app1-sample2", namespace)
}

func DeleteOssResource(namespace, systemNamespace string) {
	deleteBucket("app1-sample2", namespace)
	deleteBucket("app1-sample1", namespace)
	deleteUser("app1", namespace)
	deleteStore("store-sample", systemNamespace)
}
