package e2e

import (
	"github.com/labring/laf/pkg/common"
	"github.com/labring/laf/tests/api"
	"testing"
)

func TestCreateApp(t *testing.T) {
	namespace := common.GetSystemNamespace()

	// create  laf system namespace
	api.EnsureNamespace(namespace)

}
