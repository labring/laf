package e2e

import (
	appv1 "github.com/labring/laf/controllers/application/api/v1"
	"github.com/labring/laf/controllers/application/tests/api"
	runtimeapi "github.com/labring/laf/controllers/runtime/tests/api"
	"github.com/labring/laf/pkg/common"
	baseapi "github.com/labring/laf/tests/api"
	"testing"
)

func TestCreateApp(t *testing.T) {
	const namespace = "testing-app-creation"
	const name = "test-app"
	const appid = "test-appid"
	const runtimeName = name
	const bundleName = name
	const region = "test-region"

	var systemNamespace = common.GetSystemNamespace()

	t.Run("create app should be ok", func(t *testing.T) {
		baseapi.EnsureDefaultSystemNamespace()

		t.Log("create the testing namespace")
		baseapi.EnsureNamespace(namespace)

		t.Log("create the runtime")
		runtimeapi.CreateAppRuntime(systemNamespace, runtimeName)

		t.Log("create the bundle")
		api.CreateAppBundle(systemNamespace, bundleName)

		t.Log("create the app")
		api.CreateApplication(namespace, name, appid, runtimeName, bundleName, region)

		t.Log("wait for the app to be ready")
		api.WaitForApplicationReady(namespace, name)

		t.Log("get the app")
		app, err := api.GetApplication(namespace, name)
		if err != nil {
			t.Fatalf("ERROR: get app failed: %v", err)
		}

		t.Log("verify the app")
		if app.Name != name {
			t.Fatalf("ERROR: app name is not correct, expect %s, got %s", name, app.Name)
		}

		t.Log("verify the runtime")
		if app.Status.RuntimeName != runtimeName {
			t.Errorf("ERROR: runtime name expect %s got %s", runtimeName, app.Status.RuntimeName)
		}

		if app.Status.RuntimeSpec.Type != "node:laf" {
			t.Errorf("ERROR: invalid runtime type got %s", app.Status.RuntimeSpec.Type)
		}

		t.Log("verify")
		if app.Status.Phase != appv1.ApplicationStateRunning {
			t.Errorf("ERROR: invalid app phase got %s", app.Status.Phase)
		}

		t.Log("verify the bundle")
		if app.Status.BundleName != bundleName {
			t.Errorf("ERROR: bundle name expect %s got %s", bundleName, app.Status.BundleName)
		}

		if app.Status.BundleSpec.DisplayName == "" {
			t.Errorf("ERROR: bundle display name cannot be empty")
		}

	})

	t.Cleanup(func() {
		t.Log("clean up: delete the app")
		api.DeleteApplication(namespace, name)

		t.Log("clean up: waiting for the app to be deleted completely")
		api.WaitForApplicationDeleted(namespace, name)

		t.Log("clean up: delete the bundle")
		api.DeleteAppBundle(systemNamespace, bundleName)

		t.Log("clean up: delete the runtime")
		runtimeapi.DeleteAppRuntime(systemNamespace, runtimeName)

		t.Log("clean up: delete the namespace")
		baseapi.DeleteNamespace(namespace)

		t.Log("clean up: delete the system namespace")
		baseapi.DeleteNamespace(systemNamespace)
	})
}
