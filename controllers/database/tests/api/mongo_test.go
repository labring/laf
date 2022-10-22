package api

import (
	baseapi "github.com/labring/laf/tests/api"
	"testing"
)

func TestInstallMongoDb(t *testing.T) {
	const namespace = "testing-db-install-mongodb"

	t.Run("install mongodb should be ok", func(t *testing.T) {
		baseapi.EnsureNamespace(namespace)
		InstallMongoDb(namespace)
	})

	t.Cleanup(func() {
		UninstallMongoDb(namespace)
		baseapi.DeleteNamespace(namespace)
	})
}
