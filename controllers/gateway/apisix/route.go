package apisix

type RouteClient struct {
	client *Cluster
}

func NewRouteClient(c *Cluster) *RouteClient {
	return &RouteClient{client: c}
}

// Put 创建或更新路由
func (r *RouteClient) Put(id string, data map[string]interface{}) error {
	url := r.client.baseURL + "/routes/" + id
	return r.client.Put(url, "routes", data)
}

// Delete 删除路由
func (r *RouteClient) Delete(id string) error {
	url := r.client.baseURL + "/routes/" + id
	return r.client.Delete(url, "routes")
}
