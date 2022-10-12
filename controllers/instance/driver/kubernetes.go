package driver

import (
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
func GetKubernetesClient(clientConf string) *kubernetes.Clientset {
	clientConfig, err := clientcmd.NewClientConfigFromBytes([]byte(clientConf))
	if err != nil {
		panic(err.Error())
	}

	// create the client
	config, err := clientConfig.ClientConfig()
	if err != nil {
		panic(err.Error())
	}

	client, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	return client
}
