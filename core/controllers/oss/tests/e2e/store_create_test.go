package e2e

import (
	"testing"

	"github.com/labring/laf/core/controllers/oss/tests/api"
	baseapi "github.com/labring/laf/core/tests/api"
)

func TestCreateOssStore(t *testing.T) {
	const namespace = "testing-oss-store-creation-ns"
	const name = "testing-oss-store-creation-obj"
	const region = "cn-hangzhou"
	t.Run("creat a oss store should be ok", func(t *testing.T) {
		t.Log("create the namespace: " + namespace)
		baseapi.EnsureNamespace(namespace)

		t.Log("install minio server")
		api.InstallMinio(namespace, region)

		t.Log("create a oss store")
		api.CreateOssStore(namespace, name, region, api.GetMinioHostname())

		t.Log("waiting for oss store to be ready")
		api.WaitForOssStoreReady(namespace, name)

		t.Log("verify the oss store is created")
		store, err := api.GetOssStore(namespace, name)
		if err != nil {
			t.Fatalf("get oss store failed, err: %v", err)
		}

		if store == nil {
			t.Fatalf("get oss store failed, store is nil")
		}
	})

	t.Cleanup(func() {
		t.Log("clean up: deleting the oss store")
		api.DeleteOssStore(namespace, name)

		t.Log("clean up: waiting for the oss store to be deleted")
		api.WaitForOssStoreDeleted(namespace, name)

		t.Log("clean up: uninstall mongo server")
		api.UninstallMinio(namespace)

		t.Log("clean up: deleting the namespace")
		baseapi.DeleteNamespace(namespace)
	})
}
