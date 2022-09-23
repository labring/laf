package api

import (
	baseapi "github.com/labring/laf/tests/api"
	"testing"
)

func TestInstallMinio(t *testing.T) {
	const namespace = "testing-install-minio"
	const region = "us-east-1"

	t.Run("install minio should be ok", func(t *testing.T) {
		baseapi.EnsureNamespace(namespace)
		InstallMinio(namespace, region)
	})

	t.Cleanup(func() {
		UninstallMinio(namespace)
		baseapi.DeleteNamespace(namespace)
	})
}

func TestGetMinioHostname(t *testing.T) {
	t.Run("get minio hostname should be ok", func(t *testing.T) {
		want := baseapi.GetNodeAddress() + ":30090"
		if got := GetMinioHostname(); got != want {
			t.Errorf("GetMinioHostname() = %v, want %v", got, want)
		}
	})
}
