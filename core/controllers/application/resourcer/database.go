package resourcer

import (
	"context"

	appv1 "github.com/labring/laf/core/controllers/application/api/v1"
	v1 "github.com/labring/laf/core/controllers/database/api/v1"
	"github.com/labring/laf/core/pkg/common"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
)

func CreateDatabase(ctx context.Context, c client.Client, schema *runtime.Scheme, app *appv1.Application) error {

	// Create a new database
	var db v1.Database
	db.Namespace = app.Namespace
	db.Name = "mongodb"
	db.Labels = map[string]string{
		"laf.dev/appid": app.Spec.AppId,
	}

	db.Spec.Provider = "mongodb"
	db.Spec.Region = app.Spec.Region
	db.Spec.Username = app.Spec.AppId
	db.Spec.Password = common.GenerateAlphaNumericPassword(64)
	db.Spec.Capacity.Storage = app.Status.BundleSpec.DatabaseCapacity

	if err := controllerutil.SetControllerReference(app, &db, schema); err != nil {
		return err
	}

	err := c.Create(ctx, &db)
	return err
}

func GetDatabase(ctx context.Context, c client.Client, app *appv1.Application) (*v1.Database, error) {

	// Get the database
	var db v1.Database
	err := c.Get(ctx, client.ObjectKey{Namespace: app.Namespace, Name: "mongodb"}, &db)
	return &db, err
}

func DeleteDatabase(ctx context.Context, c client.Client, app *appv1.Application) error {

	// Delete the database
	db, err := GetDatabase(ctx, c, app)
	if err != nil {
		return err
	}

	err = c.Delete(ctx, db)
	return err
}
