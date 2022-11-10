package resourcer

import (
	"context"

	appv1 "github.com/labring/laf/core/controllers/application/api/v1"
	v1 "github.com/labring/laf/core/controllers/gateway/api/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
)

func CreateGateway(ctx context.Context, c client.Client, schema *runtime.Scheme, app *appv1.Application) error {

	// Create a new gateway
	var gw v1.Gateway
	gw.Namespace = app.Namespace
	gw.Name = "gateway"
	gw.Labels = map[string]string{
		"laf.dev/appid": app.Spec.AppId,
	}

	gw.Spec.AppId = app.Spec.AppId

	// TODO? may the gateway add region spec field
	// gw.Spec.Region = app.Spec.AppId

	if err := controllerutil.SetControllerReference(app, &gw, schema); err != nil {
		return err
	}
	err := c.Create(ctx, &gw)
	return err
}

func GetGateway(ctx context.Context, c client.Client, app *appv1.Application) (*v1.Gateway, error) {
	// Get the gateway
	var gw v1.Gateway
	err := c.Get(ctx, client.ObjectKey{Namespace: app.Namespace, Name: "gateway"}, &gw)
	return &gw, err
}
