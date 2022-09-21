package e2e

import (
	"github.com/labring/laf/controllers/database/tests/api"
	baseapi "github.com/labring/laf/tests/api"
	"testing"
)

func TestCreateStore(t *testing.T) {

	const storeYaml = `
---
apiVersion: database.laf.dev/v1
kind: Store
metadata:
  name: testing-db-store-create
  namespace: testing-db-store-create
spec:
  provider: mongodb
  region: default
  connectionURI: mongodb://root:password123@mongo.default:27017/?authSource=admin
  capacity:
    userCount: 1000
    storage: 100Gi
    databaseCount: 1000
    collectionCount: 10000
`

	t.Run("create a store should be ok", func(t *testing.T) {
		baseapi.EnsureNamespace("testing-db-store-create")
		_, err := baseapi.KubeApply(storeYaml)
		if err != nil {
			t.FailNow()
		}

		// get the store to verify
		store, err := api.GetDatabaseStore("testing-db-store-create", "testing-db-store-create")
		if err != nil {
			t.Error(err)
			t.FailNow()
		}
		if store == nil {
			t.Error("store should not be nil")
			t.FailNow()
		}

		if store.Name != "testing-db-store-create" {
			t.Error("store name is not correct")
			t.Fail()
		}

		if store.Namespace != "testing-db-store-create" {
			t.Error("store namespace is not correct")
			t.Fail()
		}

		if store.Spec.Region != "default" {
			t.Error("store region is not correct")
			t.Fail()
		}
	})

	t.Cleanup(func() {
		_, _ = baseapi.KubeDelete(storeYaml)
		baseapi.DeleteNamespace("testing-db-store-create")
	})
}
