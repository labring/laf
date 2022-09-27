package resourcer

import (
	"context"
	appv1 "github.com/labring/laf/controllers/application/api/v1"
	databasev1 "github.com/labring/laf/controllers/database/api/v1"
	"github.com/labring/laf/pkg/common"
)

func CreateAppDatabase(ctx context.Context, app *appv1.Application) error {
	//client := GetClient()

	// Create a new database
	var db databasev1.Database
	db.Namespace = app.Namespace
	db.Name = "mongodb"
	db.Labels = map[string]string{
		"laf.dev/appid": app.Spec.AppId,
	}

	db.Spec.Provider = "mongodb"
	db.Spec.Region = app.Spec.Region
	db.Spec.Password = common.GenerateAlphaNumericPassword(64)

	return nil
}
