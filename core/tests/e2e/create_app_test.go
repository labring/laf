package e2e

import (
	"testing"

	"github.com/labring/laf/core/pkg/common"
	"github.com/labring/laf/core/tests/api"
)

func TestCreateApp(t *testing.T) {
	namespace := common.GetSystemNamespace()

	// create  laf system namespace
	api.EnsureNamespace(namespace)

}
