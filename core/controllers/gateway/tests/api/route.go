package api

import (
	"context"

	gatewayv1 "github.com/labring/laf/core/controllers/gateway/api/v1"
	baseapi "github.com/labring/laf/core/tests/api"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

func GetRoutes(namespace string) ([]gatewayv1.Route, error) {
	client := baseapi.GetDefaultDynamicClient()
	gvr := schema.GroupVersionResource{
		Group:    gatewayv1.GroupVersion.Group,
		Version:  gatewayv1.GroupVersion.Version,
		Resource: "routes",
	}

	objs, err := client.Resource(gvr).Namespace(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	var routes gatewayv1.RouteList
	err = runtime.DefaultUnstructuredConverter.FromUnstructured(objs.UnstructuredContent(), &routes)
	if err != nil {
		return nil, err
	}

	return routes.Items, nil
}
