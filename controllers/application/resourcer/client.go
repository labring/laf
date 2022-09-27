package resourcer

import "sigs.k8s.io/controller-runtime/pkg/client"

var (
	// Client is a global client for all controllers
	Client client.Client
)

func init() {
	Client = nil
}

func SetClient(c client.Client) {
	Client = c
}

func GetClient() client.Client {
	return Client
}
