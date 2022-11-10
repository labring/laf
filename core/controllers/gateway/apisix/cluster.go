package apisix

import (
	"fmt"
	"github.com/go-resty/resty/v2"
	"net/http"
)

type Cluster struct {
	baseURL  string
	adminKey string

	client *resty.Client

	Route *RouteClient
}

func NewCluster(baseURL string, adminKey string) *Cluster {
	c := &Cluster{
		baseURL:  baseURL,
		adminKey: adminKey,
		client:   resty.New(),
	}
	c.Route = NewRouteClient(c)
	return c
}

func (c *Cluster) Put(url, resource string, data map[string]interface{}) error {
	resp, err := c.client.
		R().
		SetHeader("X-API-KEY", c.adminKey).
		SetBody(data).
		Put(url)
	if err != nil {
		return err
	}
	if resp.StatusCode() != http.StatusCreated && resp.StatusCode() != http.StatusOK {
		return fmt.Errorf("put %s failed", resource)
	}
	return nil
}

func (c *Cluster) Delete(url, resource string) error {
	resp, err := c.client.
		R().
		SetHeader("X-API-KEY", c.adminKey).
		Delete(url)
	if err != nil {
		return err
	}
	if resp.StatusCode() != http.StatusOK && resp.StatusCode() != http.StatusNotFound {
		return fmt.Errorf("delete %s failed", resource)
	}
	return nil
}
