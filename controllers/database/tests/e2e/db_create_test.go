package e2e

import (
	"github.com/labring/laf/controllers/database/dbm"
	"github.com/labring/laf/controllers/database/tests/api"
	baseapi "github.com/labring/laf/tests/api"
	"testing"
)

func TestDbCreate(t *testing.T) {
	const name = "testing-db-creation"
	const region = "testing-default"

	t.Run("create db should be ok", func(t *testing.T) {

		t.Log("creating a mongodb server")
		api.InstallMongoDb(name)

		t.Log("creating a store")
		api.CreateDatabaseStore(name, name+"-store", region, api.GetMongoDbConnectionURI())

		t.Log("creating a db")
		api.CreateDatabase(name, region)

		_, err := baseapi.Exec("kubectl wait --for=condition=ready --timeout=60s database/" + name + " -n " + name)
		if err != nil {
			t.Error("kubectl wait for database creation failed")
			t.FailNow()
		}

		t.Log("verifying the db is created")
		db, err := api.GetDatabase(name)
		if err != nil {
			t.Error(err)
			t.FailNow()
		}

		if db.Name != name {
			t.Errorf("expected db name to be %s, got %s", name, db.Name)
			t.FailNow()
		}

		t.Log("verifying the db region")
		if db.Spec.Region != region {
			t.Errorf("db region should be %s, but got %s", region, db.Spec.Region)
			t.Fail()
		}

		t.Log("verifying the db store & store namespace")
		if db.Status.StoreName != name+"-store" {
			t.Errorf("expected: %s, got: %s", name+"-store", db.Status.StoreName)
			t.Fail()
		}

		if db.Status.StoreNamespace != name {
			t.Errorf("expected: %s, got: %s", name, db.Status.StoreNamespace)
			t.Fail()
		}

		// check if labels exists
		t.Log("verifying the db has labels")
		if db.Labels["laf.dev/database.store.name"] != db.Status.StoreName {
			t.Errorf("expected: %s, got: %s", db.Status.StoreName, db.Labels["laf.dev/database.store.name"])
			t.Fail()
		}

		if db.Labels["laf.dev/database.store.namespace"] != db.Status.StoreNamespace {
			t.Errorf("expected: %s, got: %s", db.Status.StoreNamespace, db.Labels["laf.dev/database.store.namespace"])
			t.Fail()
		}

		t.Log("verifying the db connection uri")
		expectUri, _ := dbm.AssembleUserDatabaseUri(api.GetMongoDbConnectionURI(), db.Spec.Username, db.Spec.Password, db.Name)
		if db.Status.ConnectionUri != expectUri {
			t.Errorf("expected: %s, got: %s", api.GetMongoDbConnectionURI(), db.Status.ConnectionUri)
			t.Fail()
		}
	})

	t.Cleanup(func() {
		api.DeleteDatabase(name, region)

		_, err := baseapi.Exec("kubectl wait --for=delete --timeout=60s database/" + name + " -n " + name)
		if err != nil {
			t.Error("delete database failed, please abort the test and delete the database manually")
			panic(err)
		}

		api.DeleteDatabaseStore(name, name+"-store", region)
		api.UninstallMongoDb(name)
		baseapi.DeleteNamespace(name)
	})
}
