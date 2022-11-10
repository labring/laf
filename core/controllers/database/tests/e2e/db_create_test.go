package e2e

import (
	"testing"

	"github.com/labring/laf/core/controllers/database/dbm"
	"github.com/labring/laf/core/controllers/database/tests/api"
	baseapi "github.com/labring/laf/core/tests/api"
)

func TestDbCreate(t *testing.T) {
	const namespace = "testing-db-creation"
	const name = "testing-db"
	const appid = "testing-db-appid"
	const region = "testing-region"

	t.Run("create db should be ok", func(t *testing.T) {
		baseapi.EnsureNamespace(namespace)

		t.Log("installing a mongodb server")
		api.InstallMongoDb(namespace)

		t.Log("creating a store")
		api.CreateDatabaseStore(namespace, name, region, api.GetMongoDbConnectionUri())

		t.Log("creating a db")
		api.CreateDatabase(namespace, name, appid, region)

		t.Log("waiting for the db ready")
		api.WaitForDatabaseReady(namespace, name)

		t.Log("verifying the db is created")
		db, err := api.GetDatabase(namespace, name)
		if err != nil {
			t.Fatalf("failed to get db: %v", err)
		}

		t.Log("verifying the db store & store namespace")
		if db.Status.StoreName != name {
			t.Fatalf("expected: %s, got: %s", name+"-store", db.Status.StoreName)
		}

		if db.Status.StoreNamespace != namespace {
			t.Fatalf("expected: %s, got: %s", name, db.Status.StoreNamespace)
		}

		// check if labels exists
		t.Log("verifying the db has labels")
		if db.Labels["laf.dev/database.store.name"] != db.Status.StoreName {
			t.Errorf("expected: %s, got: %s", db.Status.StoreName, db.Labels["laf.dev/database.store.name"])
		}

		if db.Labels["laf.dev/database.store.namespace"] != db.Status.StoreNamespace {
			t.Errorf("expected: %s, got: %s", db.Status.StoreNamespace, db.Labels["laf.dev/database.store.namespace"])
		}

		t.Log("verifying the db connection uri")
		expectUri, _ := dbm.AssembleUserDatabaseUri(api.GetMongoDbConnectionUri(), db.Spec.Username, db.Spec.Password, db.Name)
		if db.Status.ConnectionUri != expectUri {
			t.Errorf("expected: %s, got: %s", api.GetMongoDbConnectionUri(), db.Status.ConnectionUri)
		}
	})

	t.Cleanup(func() {
		t.Log("deleting the db")
		api.DeleteDatabase(namespace, name)

		t.Log("waiting for the db deleted")
		api.WaitForDatabaseDeleted(namespace, name)

		t.Log("deleting the store")
		api.DeleteDatabaseStore(namespace, name)

		t.Log("waiting for the store deleted")
		api.WaitForDatabaseStoreDeleted(namespace, name)

		t.Log("uninstalling mongodb server")
		api.UninstallMongoDb(namespace)

		t.Log("deleting the namespace")
		baseapi.DeleteNamespace(namespace)
	})
}
