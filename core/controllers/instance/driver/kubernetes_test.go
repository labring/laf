package driver

import (
	"context"
	"fmt"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"testing"
)

func TestGetKubernetesClient(t *testing.T) {
	t.Run("get client should be ok", func(t *testing.T) {
		// get the client
		client, err := GetKubernetesClient()
		if err != nil {
			panic(err.Error())
		}
		list, err := client.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
		if err != nil {
			panic(err.Error())
		}

		fmt.Printf("list: %v", len(list.Items))
	})
}
