package driver

import (
	"encoding/base64"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	//
	// Uncomment to load all auth plugins
	_ "k8s.io/client-go/plugin/pkg/client/auth"
	//
	// Or uncomment to load specific auth plugins
	// _ "k8s.io/client-go/plugin/pkg/client/auth/azure"
	// _ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	// _ "k8s.io/client-go/plugin/pkg/client/auth/oidc"
)

// GetKubernetesClient returns a kubernetes client
func GetKubernetesClient(clientConf string) (*kubernetes.Clientset, error) {
	bs64, err := base64.StdEncoding.DecodeString(clientConf)
	if err != nil {
		return nil, err
	}
	clientConfig, err := clientcmd.NewClientConfigFromBytes(bs64)
	if err != nil {
		return nil, err
	}

	// create the client
	config, err := clientConfig.ClientConfig()
	if err != nil {
		return nil, err
	}

	client, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, err
	}

	return client, nil
}
