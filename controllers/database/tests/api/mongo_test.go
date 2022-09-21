package api

import (
	"laf/tests/api"
	"testing"
)

func TestInstallMongoDb(t *testing.T) {
	t.Run("install mongodb should be ok", func(t *testing.T) {
		InstallMongoDb("testing-db-install-mongodb")
	})

	t.Cleanup(func() {
		UninstallMongoDb("testing-db-install-mongodb")
		api.DeleteNamespace("testing-db-install-mongodb")
	})
}
