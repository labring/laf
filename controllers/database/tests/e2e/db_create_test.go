package e2e

import (
	"github.com/labring/laf/controllers/database/tests/api"
	baseapi "laf/tests/api"
	"testing"
)

func TestDbCreate(t *testing.T) {
	const name = "testing-db-creation"

	t.Run("create db should be ok", func(t *testing.T) {

		// create a mongodb server
		t.Log("creating a mongodb server")
		api.InstallMongoDb(name)

		// create a store named "testing-db-creation-store"
		t.Log("creating a store named \"testing-db-creation\"")
		hostname := baseapi.GetNodeAddress() + ":30017"
		api.CreateDatabaseStore(name, name, "testing-default", hostname)

		// create a db named "testing-db-creation-db"
		t.Log("creating a db named \"testing-db-creation\"")
		api.CreateDatabase(name, "testing-default")

		// verify the db is created
		t.Log("verifying the db is created")
		db, err := api.GetDatabase(name)
		if err != nil {
			t.Error(err)
			t.FailNow()
		}

		if db.Status.ConnectionURI == "" {
			t.Error("db connection uri is empty")
			t.FailNow()
		}
	})

	t.Cleanup(func() {
		//api.DeleteDatabase(name, "testing-default")
	})
}
