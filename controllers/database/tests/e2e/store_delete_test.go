package e2e

import (
	"testing"
)

func TestDeleteStore(t *testing.T) {

	const storeYaml = `
---
apiVersion: database.laf.dev/v1
kind: Store
metadata:
  name: testing-db-store-delete
  namespace: testing-db-store-delete
spec:
  provider: mongodb
  region: default
  connectionUri: mongodb://root:password123@mongo.default:27017/?authSource=admin
  capacity:
    userCount: 1000
    storage: 100Gi
    databaseCount: 1000
    collectionCount: 10000
`

	// TODO
	t.Run("delete a used store should be rejected", func(t *testing.T) {
		// create a store

		// create a database using the store

		// delete the store while the database already using it

		// verify the store is not deleted

	})

	t.Cleanup(func() {
		//_, _ = baseapi.KubeDelete(storeYaml)
		//baseapi.DeleteNamespace("testing-db-store-delete")
	})
}
