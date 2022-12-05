package e2e

import (
	appv1 "github.com/labring/laf/core/controllers/application/api/v1"
	api4 "github.com/labring/laf/core/controllers/database/tests/api"
	api5 "github.com/labring/laf/core/controllers/oss/tests/api"
	"testing"

	"github.com/labring/laf/core/controllers/application/tests/api"
	//api2 "github.com/labring/laf/core/controllers/runtime/tests/api"
	"github.com/labring/laf/core/pkg/common"
	baseapi "github.com/labring/laf/core/tests/api"
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
		//api2.CreateAppRuntime(systemNamespace, runtimeName)

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

		t.Log("verify the runtime")
		//if app.Status.RuntimeName != runtimeName {
		//	t.Errorf("ERROR: runtime name expect %s got %s", runtimeName, app.Status.RuntimeName)
		//}

		//if app.Status.RuntimeSpec.Type != "node:laf" {
		//	t.Errorf("ERROR: invalid runtime type got %s", app.Status.RuntimeSpec.Type)
		//}

		t.Log("verify the phase is running")
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

		t.Log("verify the database created")
		database, err := api4.GetDatabase(namespace, "mongodb")
		if err != nil {
			t.Errorf("ERROR: get database failed: %v", err)
		}

		if database.Spec.Username != appid {
			t.Errorf("ERROR: database username expect %s got %s", appid, database.Spec.Username)
		}

		if database.Spec.Password == "" {
			t.Errorf("ERROR: database password cannot be empty")
		}

		if database.Spec.Capacity.Storage != app.Status.BundleSpec.DatabaseCapacity {
			t.Errorf("ERROR: database capacity expect %s got %s", app.Status.BundleSpec.DatabaseCapacity.String(), database.Spec.Capacity.Storage.String())
		}

		if database.Labels["laf.dev/appid"] != appid {
			t.Errorf("ERROR: database appid expect %s got %s", appid, database.Labels["laf.dev/appid"])
		}

		if database.OwnerReferences[0].Name != name {
			t.Errorf("ERROR: db owner reference expect %s got %s", name, database.OwnerReferences[0].Name)
		}

		t.Log("verify the oss user")
		ossUser, err := api5.GetOssUser(namespace, "oss")
		if err != nil {
			t.Errorf("ERROR: get oss user failed: %v", err)
		}

		if ossUser.Spec.AppId != appid {
			t.Errorf("ERROR: oss user appid expect %s got %s", appid, ossUser.Spec.AppId)
		}

		if ossUser.Spec.Region != region {
			t.Errorf("ERROR: oss user region expect %s got %s", region, ossUser.Spec.Region)
		}

		if ossUser.Spec.Provider != "minio" {
			t.Errorf("ERROR: oss user provider expect minio got %s", ossUser.Spec.Provider)
		}

		if ossUser.Spec.Password == "" {
			t.Errorf("ERROR: oss user password cannot be empty")
		}

		if ossUser.Spec.Capacity.Storage != app.Status.BundleSpec.StorageCapacity {
			t.Errorf("ERROR: oss user capacity expect %s got %s", app.Status.BundleSpec.StorageCapacity.String(), ossUser.Spec.Capacity.Storage.String())
		}

		if ossUser.Labels["laf.dev/appid"] != appid {
			t.Errorf("ERROR: oss user appid expect %s got %s", appid, ossUser.Labels["laf.dev/appid"])
		}

		if ossUser.OwnerReferences[0].Name != name {
			t.Errorf("ERROR: oss user owner reference expect %s got %s", name, ossUser.OwnerReferences[0].Name)
		}

		// TODO? verify the gateway while gateway testing api supported
		t.Log("TODO: verify the gateway")

	})

	t.Cleanup(func() {
		//t.Log("clean up: delete the app")
		//api.DeleteApplication(namespace, name)
		//
		//t.Log("clean up: waiting for the app to be deleted completely")
		//api.WaitForApplicationDeleted(namespace, name)
		//
		//t.Log("clean up: delete the bundle")
		//api.DeleteAppBundle(systemNamespace, bundleName)
		//
		//t.Log("clean up: delete the runtime")
		//api2.DeleteAppRuntime(systemNamespace, runtimeName)
		//
		//t.Log("clean up: delete the namespace")
		//baseapi.DeleteNamespace(namespace)
		//
		//t.Log("clean up: delete the system namespace")
		//baseapi.DeleteNamespace(systemNamespace)
	})
}
