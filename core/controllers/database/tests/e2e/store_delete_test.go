package e2e

import (
	"testing"
)

func TestDeleteStore(t *testing.T) {

	// TODO: delete a used store should be rejected
	t.Run("delete a used store should be rejected", func(t *testing.T) {
		t.Log("TODO: delete a used store should be rejected")
	})

	t.Cleanup(func() {
	})
}
