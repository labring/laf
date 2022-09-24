package e2e

import (
	"github.com/labring/laf/controllers/gateway/tests/api"
	baseapi "github.com/labring/laf/tests/api"
	"testing"
)

func TestCreateGateway(t *testing.T) {
	const systemNamespace = "app-system"
	const appId = "firstapp"
	const namespace = "app"

	t.Run("create gateway should be ok", func(t *testing.T) {
		baseapi.EnsureNamespace(systemNamespace)
		baseapi.EnsureNamespace(namespace)

		t.Log("install a apisix server")
		// 需要使用helm安装，这里先暂时不实现

		t.Log("create a oss resource")
		api.CreateOssResource(namespace, systemNamespace)

		t.Log("create a domain resource")
		api.CreateDomain("default", systemNamespace)

		t.Log("create a gateway resource")
		api.CreateGateway(appId+"gw", namespace, appId)
		api.WaitForGatewayReady(appId+"gw", namespace)

		t.Log("verify the route is created")
		routes, err := api.GetRoutes(namespace)
		if err != nil {
			t.Fatalf("get routes failed: %v", err)
		}
		if len(routes) != 1 {
			t.Fatalf("routes size not 1, current = %d", len(routes))
		}
		if routes[0].Status.Domain == "" {
			t.Fatalf("routes create failed")
		}

		t.Log("add a gateway bucket resource")
		api.AddGatewayBucket(appId+"gw", namespace, appId, "app1")
		t.Log("verify the route is created")
		routes, err = api.GetRoutes(namespace)
		if err != nil {
			t.Fatalf("get routes failed: %v", err)
		}
		if len(routes) != 1 {
			t.Fatalf("routes size not 1, current = %d", len(routes))
		}

		t.Log("delete a gateway bucket resource")
		api.DeleteGatewayBucket(appId+"gw", namespace, appId)
		t.Log("verify the route is created")
		routes, err = api.GetRoutes(namespace)
		if err != nil {
			t.Fatalf("get routes failed: %v", err)
		}
		if len(routes) != 1 {
			t.Fatalf("routes size not 1, current = %d", len(routes))
		}
	})

	t.Cleanup(func() {
		t.Log("clean up: delete the gateway")
		api.DeleteGateway(appId+"gw", namespace, appId)

		t.Log("clean up: delete the oss")
		api.DeleteOssResource(namespace, systemNamespace)

		t.Log("clean up: delete the namespace")
		baseapi.DeleteNamespace(namespace)
		baseapi.DeleteNamespace(systemNamespace)
	})
}
