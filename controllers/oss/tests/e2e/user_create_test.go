package e2e

import (
	"github.com/labring/laf/controllers/oss/tests/api"
	"github.com/labring/laf/pkg/util"
	baseapi "github.com/labring/laf/tests/api"
	"testing"
)

func TestCreateOssUser(t *testing.T) {
	const namespace = "testing-oss-user-creation"
	const name = "testing-oss-user-creation"
	const appid = "testing-oss-user-creation"
	const region = "testing-default"

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

		t.Log("verify the oss user is created")
		user, err := api.GetOssUser(namespace, name)
		if err != nil {
			t.Fatalf("get oss user failed: %v", err)
		}

		t.Log("verify the user region")
		if user.Status.Region != region {
			t.Fatalf("1. user region is not correct, expected %s, got %s", region, user.Status.Region)
		}

		if user.Status.Region != user.Spec.Region {
			t.Fatalf("2. user region is not correct, expected %s, got %s", user.Spec.Region, user.Status.Region)
		}

		t.Log("verify the use store")
		if user.Status.StoreName != name+"-store" {
			t.Fatalf("user store is not correct, expected %s, got %s", name+"-store", user.Status.StoreName)
		}

		if user.Status.StoreNamespace != name {
			t.Fatalf("user store namespace is not correct, expected %s, got %s", name, user.Status.StoreNamespace)
		}

		t.Log("verify the user endpoint")
		if user.Status.Endpoint != api.GetMinioHostname() {
			t.Fatalf("user endpoint is not correct, expected %s, got %s", api.GetMinioHostname(), user.Status.Endpoint)
		}

		t.Log("verify the user access key")
		if user.Status.AccessKey != name {
			t.Fatalf("user access key is not correct, expected %s, got %s", name, user.Status.AccessKey)
		}

		t.Log("verify the user secret key")
		if user.Status.SecretKey != user.Spec.Password {
			t.Fatalf("user secret key is not correct, expected %s, got %s", user.Spec.Password, user.Status.SecretKey)
		}

		t.Log("verify the condition ready")
		if util.IsConditionsTrue(user.Status.Conditions, "Ready") != true {
			t.Fatalf("user condition ready is not true")
		}
	})

	t.Cleanup(func() {
		t.Log("clean up: deleting the oss user")
		api.DeleteOssUser(namespace, name)

		t.Log("clean up: waiting for oss user to be deleted completely...")
		api.WaitForOssUserDeleted(namespace, name)

		t.Log("clean up: deleting the oss store")
		api.DeleteOssStore(name, name+"-store")

		t.Log("clean up: uninstalling the minio server")
		api.UninstallMinio(name)

		t.Log("clean up: deleting the namespace")
		baseapi.DeleteNamespace(name)
	})
}
