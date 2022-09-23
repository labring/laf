package e2e

import (
	"github.com/labring/laf/controllers/oss/tests/api"
	baseapi "github.com/labring/laf/tests/api"
	"testing"
)

func TestCreateOssBucket(t *testing.T) {
	const namespace = "testing-oss-bucket-creation"
	const name = "testing-oss-bucket-creation"
	const appid = "testing-appid"
	const region = "testing-region"

	t.Run("create user should be ok", func(t *testing.T) {
		baseapi.EnsureNamespace(namespace)

		t.Log("install a minio server")
		api.InstallMinio(namespace, region)

		t.Log("create a minio store")
		api.CreateOssStore(namespace, name+"-store", region, api.GetMinioHostname())

		t.Log("create a oss user")
		api.CreateOssUser(namespace, name, appid, region)

		t.Log("waiting for oss user to be ready")
		api.WaitForOssUserReady(namespace, name)

		t.Log("create a oss bucket")
		api.CreateOssBucket(namespace, name, appid)

		t.Log("waiting for oss bucket to be ready")
		api.WaitForOssBucketReady(namespace, name)

		t.Log("verify the oss bucket is created")
		bucket, err := api.GetOssBucket(namespace, name)
		if err != nil {
			t.Fatalf("get oss bucket failed: %v", err)
		}

		t.Log("verify the bucket user")
		if bucket.Status.User != name {
			t.Fatalf("expected bucket user %s, got %s", name, bucket.Status.User)
		}

		t.Log("verify bucket versioning")
		if bucket.Status.Versioning != true {
			t.Fatalf("expected bucket versioning to be true, got false")
		}
	})

	t.Cleanup(func() {
		t.Log("clean up: delete the bucket")
		api.DeleteOssBucket(namespace, name)

		t.Log("clean up: waiting for bucket to be deleted completely...")
		api.WaitForOssBucketDeleted(namespace, name)

		t.Log("clean up: deleting the oss user")
		api.DeleteOssUser(namespace, name)

		t.Log("clean up: waiting for oss user to be deleted completely...")
		api.WaitForOssUserDeleted(namespace, name)

		t.Log("clean up: deleting the oss store")
		api.DeleteOssStore(namespace, name+"-store")

		t.Log("clean up:  waiting for oss store to be deleted completely...")
		api.WaitForOssStoreDeleted(namespace, name+"-store")

		t.Log("clean up: uninstalling the minio server")
		api.UninstallMinio(namespace)

		t.Log("clean up: deleting the namespace")
		baseapi.DeleteNamespace(namespace)
	})
}
