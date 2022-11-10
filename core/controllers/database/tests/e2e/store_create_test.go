package e2e

import (
	"testing"

	"github.com/labring/laf/core/controllers/database/tests/api"
	baseapi "github.com/labring/laf/core/tests/api"
)

func TestDatabaseCreateStore(t *testing.T) {
	const namespace = "testing-db-store-creation"
	const name = "testing-store"
	const region = "testing-store-region"

	t.Run("create a database store should be ok", func(t *testing.T) {
		baseapi.EnsureNamespace(namespace)

		t.Log("create a database store")
		api.CreateDatabaseStore(namespace, name, region, api.GetMongoDbConnectionUri())

		t.Log("verify the store is created")
		store, err := api.GetDatabaseStore(namespace, name)
		if err != nil {
			t.Fatalf("failed to get store: %v", err)
		}

		if store.Spec.Region != region {
			t.Fatalf("store region is not correct, expected %s, got %s", region, store.Spec.Region)
		}
	})

	t.Cleanup(func() {
		t.Log("delete the store")
		api.DeleteDatabaseStore(namespace, name)

		t.Log("delete the namespace")
		baseapi.DeleteNamespace(namespace)
	})
}
