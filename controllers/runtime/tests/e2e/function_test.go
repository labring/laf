package e2e

import (
	"github.com/labring/laf/controllers/runtime/tests/api"
	baseapi "github.com/labring/laf/tests/api"
	"testing"
	"time"
)

func TestFunction(t *testing.T) {
	const mongoNamespace = "testing-db"
	const namespace = "testing-function"
	t.Run("create function should be ok", func(t *testing.T) {
		t.Log("create namespace")
		baseapi.EnsureNamespace(namespace)
		baseapi.EnsureNamespace(mongoNamespace)

		t.Log("install a mongo server")
		api.InstallMongoDb(mongoNamespace)

		t.Log("sleep 120 seconds to wait for the mongodb to be ready")
		time.Sleep(30 * time.Second)

		t.Log("create a mongo database")
		api.CreateMongoDatabase()

		t.Log("create a database crd")
		api.CreateDatabase(namespace)

		t.Log("create a function")
		api.CreateFunction("test-function", namespace)

		t.Log("sleep 30 seconds to wait for the function to be ready")
		time.Sleep(30 * time.Second)

		t.Log("check function created")
		api.CheckCreateFunction(api.GetMongoDbConnectionUri(), "test-function")

		t.Log("delete function")
		api.DeleteFunction("test-function", namespace)

		t.Log("sleep 30 seconds to wait for the function to be ready")
		time.Sleep(30 * time.Second)

		t.Log("check function deleted")
		api.CheckDeleteFunction(api.GetMongoDbConnectionUri(), "test-function")
	})

	t.Cleanup(func() {
		t.Log("uninstall mongodb")
		api.UninstallMongoDb(mongoNamespace)

		t.Log("delete namespace")
		baseapi.DeleteNamespace(mongoNamespace)
		baseapi.DeleteNamespace(namespace)
	})

}
