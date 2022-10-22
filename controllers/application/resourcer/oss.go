package resourcer

import (
	"context"
	appv1 "github.com/labring/laf/controllers/application/api/v1"
	ossv1 "github.com/labring/laf/controllers/oss/api/v1"
	"github.com/labring/laf/pkg/common"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
)

func CreateObjectStorageUser(ctx context.Context, c client.Client, schema *runtime.Scheme, app *appv1.Application) error {

	// Create a new oss user
	var oss ossv1.User
	oss.Namespace = app.Namespace
	oss.Name = "oss"
	oss.Labels = map[string]string{
		"laf.dev/appid": app.Spec.AppId,
	}

	oss.Spec.Provider = "minio"
	oss.Spec.Region = app.Spec.Region
	oss.Spec.AppId = app.Spec.AppId
	oss.Spec.Password = common.GenerateAlphaNumericPassword(64)
	oss.Spec.Capacity.Storage = app.Status.BundleSpec.StorageCapacity

	if err := controllerutil.SetControllerReference(app, &oss, schema); err != nil {
		return err
	}
	err := c.Create(ctx, &oss)
	return err
}

func GetObjectStorageUser(ctx context.Context, c client.Client, app *appv1.Application) (*ossv1.User, error) {
	// Get the oss user
	var oss ossv1.User
	err := c.Get(ctx, client.ObjectKey{Namespace: app.Namespace, Name: "oss"}, &oss)
	return &oss, err
}
