package apisix

type SSLClient struct {
	client *Cluster
}

func NewSSLClient(c *Cluster) *SSLClient {
	return &SSLClient{client: c}
}

// Put create or update ssl
func (s *SSLClient) Put(id string, data map[string]interface{}) error {
	url := s.client.baseURL + "/ssl/" + id
	return s.client.Put(url, "ssl", data)
}

// Delete delete ssl
func (s *SSLClient) Delete(id string) error {
	url := s.client.baseURL + "/ssl/" + id
	return s.client.Delete(url, "ssl")
}
