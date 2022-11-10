package e2e

import (
	"testing"

	"github.com/labring/laf/core/controllers/application/tests/api"
	baseapi "github.com/labring/laf/core/tests/api"
)

func TestCreateAppBundle(t *testing.T) {
	const namespace = "testing-bundle-creation"
	const name = "testing-bundle"
	t.Run("create app bundle should be ok", func(t *testing.T) {
		t.Log("create namespace")
		baseapi.EnsureNamespace(namespace)

		t.Log("create app bundle")
		api.CreateAppBundle(namespace, name)

		t.Log("verify the bundle is created")
		bundle, err := api.GetAppBundle(namespace, name)
		if err != nil {
			t.Fatalf("failed to get app bundle: %v", err)
		}

		if bundle.Name != name {
			t.Fatalf("failed to create app bundle")
		}
	})

	t.Cleanup(func() {
		t.Log("clean up the bundle")
		api.DeleteAppBundle(namespace, name)

		t.Log("waiting for the bundle to be deleted")
		baseapi.MustKubeWaitForDeleted(namespace, "bundles.application.laf.dev/"+name, "60s")

		t.Log("clean up the namespace")
		baseapi.DeleteNamespace(namespace)
	})
}
