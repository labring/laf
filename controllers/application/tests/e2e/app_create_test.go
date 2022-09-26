package e2e

import (
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
		api.CreateApplication(namespace, name, appid, runtimeName, bundleName)

		t.Log("get the app")
		app, err := api.GetApplication(namespace, name)
		if err != nil {
			t.Fatalf("get app failed: %v", err)
		}

		t.Log("verify the app")
		if app.Name != name {
			t.Fatalf("app name is not correct, expect %s, got %s", name, app.Name)
		}

		// TODO: verify the status / conditions
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
