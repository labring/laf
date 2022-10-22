package driver

import (
	"context"
	"fmt"
	instancev1 "github/labring/laf/controllers/instance/api/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/tools/clientcmd"
	"log"
	"os"
	"testing"
)

func TestGetKubernetesClient(t *testing.T) {

	t.Run("get client should be ok", func(t *testing.T) {
		// read the kubeconfig file to string
		filename := clientcmd.NewDefaultClientConfigLoadingRules().GetDefaultFilename()
		data, err := os.ReadFile(filename)
		if err != nil {
			t.Fatal(err)
		}
		load, err := clientcmd.Load(data)
		var clientConfig instancev1.ClientConfig
		clientConfig.Server = load.Clusters["kubernetes"].Server
		clientConfig.CertificateAuthorityData = string(load.Clusters["kubernetes"].CertificateAuthorityData)
		clientConfig.UserClientKeyData = string(load.AuthInfos["kubernetes-admin"].ClientKeyData)
		clientConfig.UserClientCertificateData = string(load.AuthInfos["kubernetes-admin"].ClientCertificateData)
		// get the client
		client, err := GetKubernetesClient(clientConfig)
		if err != nil {
			log.Fatal(err)
		}
		list, err := client.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
		if err != nil {
			panic(err.Error())
		}

		fmt.Printf("list: %v", len(list.Items))
	})
}
