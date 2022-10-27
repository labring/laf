package driver

import (
	"context"
	"encoding/base64"
	"fmt"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/clientcmd"
	"os"
	"testing"
)

func TestGetKubernetesClient(t *testing.T) {

	t.Run("get client should be ok", func(t *testing.T) {
		// read the kubeconfig file to string
		filename := clientcmd.NewDefaultClientConfigLoadingRules().GetDefaultFilename()
		kubeconfig, err := os.ReadFile(filename)
		if err != nil {
			t.Fatal(err)
		}

		// get the client
		client, err := GetKubernetesClient(base64.StdEncoding.EncodeToString(kubeconfig))
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
