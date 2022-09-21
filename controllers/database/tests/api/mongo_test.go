package api

import "testing"

func TestInstallMongoDb(t *testing.T) {
	t.Run("install mongodb should be ok", func(t *testing.T) {
		InstallMongoDb()
	})

	t.Cleanup(func() {
		UninstallMongoDb()
	})
}
