package api

import (
	databasev1 "github.com/labring/laf/controllers/database/api/v1"
	"github.com/labring/laf/tests/api"
	"testing"
)

func TestUpdateDatabaseStoreStatus(t *testing.T) {

	const name = "testing-update-status"
	t.Run("update status should be ok", func(t *testing.T) {
		api.EnsureNamespace(name)

		CreateDatabaseStore(name, name, "default", GetMongoDbConnectionUri())

		var status = databasev1.StoreStatus{
			Capacity: &databasev1.StoreCapacity{
				UserCount:       10,
				DatabaseCount:   2,
				CollectionCount: 3,
			},
		}
		UpdateDatabaseStoreStatus(name, name, status)

		store, err := GetDatabaseStore(name, name)
		if err != nil {
			t.Errorf("Error getting store: %s", err)
			t.FailNow()
		}

		if store.Status.Capacity.UserCount != status.Capacity.UserCount {
			t.Errorf("User count should be %d, but is %d", status.Capacity.UserCount, store.Status.Capacity.UserCount)
			t.Fail()
		}

		if store.Status.Capacity.DatabaseCount != status.Capacity.DatabaseCount {
			t.Errorf("Database count should be %d, but is %d", status.Capacity.DatabaseCount, store.Status.Capacity.DatabaseCount)
			t.Fail()
		}

		if store.Status.Capacity.CollectionCount != status.Capacity.CollectionCount {
			t.Errorf("Collection count should be %d, but is %d", status.Capacity.CollectionCount, store.Status.Capacity.CollectionCount)
			t.Fail()
		}
	})

}
