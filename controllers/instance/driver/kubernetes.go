package driver

import (
	instancev1 "github/labring/laf/controllers/instance/api/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	clientcmdapi "k8s.io/client-go/tools/clientcmd/api"

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
func GetKubernetesClient(clientConf instancev1.ClientConfig) (*kubernetes.Clientset, error) {

	clientConfig := clientcmd.NewDefaultClientConfig(buildConfig(clientConf), &clientcmd.ConfigOverrides{})

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

func buildConfig(clientConf instancev1.ClientConfig) clientcmdapi.Config {
	return clientcmdapi.Config{
		Kind: "Config",
		Contexts: map[string]*clientcmdapi.Context{
			"kubernetes-admin@kubernetes": {
				Cluster:  "kubernetes",
				AuthInfo: "kubernetes-admin",
			},
		},
		AuthInfos: map[string]*clientcmdapi.AuthInfo{
			"kubernetes-admin": {
				ClientKeyData:         []byte(clientConf.UserClientKeyData),
				ClientCertificateData: []byte(clientConf.UserClientCertificateData),
			},
		},
		Clusters: map[string]*clientcmdapi.Cluster{
			"kubernetes": {
				Server:                   clientConf.Server,
				CertificateAuthorityData: []byte(clientConf.CertificateAuthorityData),
			},
		},
		CurrentContext: "kubernetes-admin@kubernetes",
	}
}
