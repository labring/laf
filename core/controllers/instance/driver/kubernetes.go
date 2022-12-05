package driver

import (
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"

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
func GetKubernetesClient() (*kubernetes.Clientset, error) {
	// creates the in-cluster config
	config, err := rest.InClusterConfig()
	if err != nil {
		return nil, err
	}

	// creates the clientset
	client, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, err
	}

	return client, nil
}
