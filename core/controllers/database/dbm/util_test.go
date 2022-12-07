package dbm

import (
	"fmt"
	"testing"
)

func TestAssembleUserDatabaseUri(t *testing.T) {
	original := "mongodb://admin:passw0rd@mongo.laf.svc.cluster.local:27017?authSource=admin&replicaSet=rs0&writeConcern=majority"
	t.Run("test", func(t *testing.T) {
		r, _ := AssembleUserDatabaseUri(original, "user", "password", "appdb")
		fmt.Print(r)
	})
}
