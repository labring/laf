package apisix

import "testing"

func TestCreateRoute(t *testing.T) {
	// 创建RouteClient
	routeClient := NewRouteClient("http://localhost:9180", "edd1c9f034335f136f87ad84b625c8f1")
	routeData := map[string]interface{}{
		"uri": "/hello",
		"upstream": map[string]interface{}{
			"type": "roundrobin",
			"nodes": map[string]interface{}{
				"baidu.com": 1,
			},
		},
		"host": "test.com",
	}
	err := routeClient.PutRoute("test", routeData)
	if err != nil {
		panic(err)
	}
}

func TestDeleteRoute(t *testing.T) {
	routeClient := NewRouteClient("http://localhost:9180", "edd1c9f034335f136f87ad84b625c8f1")
	err := routeClient.DeleteRoute("test")
	if err != nil {
		panic(err)
	}
}
