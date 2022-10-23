package api

import "testing"

func TestUpdateDatabaseStatus(t *testing.T) {
	updateDatabaseStatus("mongodb", "testing-function")
}
