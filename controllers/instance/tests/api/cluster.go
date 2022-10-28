package api

import (
	"encoding/base64"
	v1 "github/labring/laf/controllers/instance/api/v1"
	"os"

	baseapi "github.com/labring/laf/tests/api"
	"k8s.io/client-go/tools/clientcmd"
)

const clusterYaml = `
apiVersion: instance.laf.dev/v1
kind: Cluster
metadata:
  name: ${name}
  namespace: ${namespace}
spec:
  region: ${region} 
  clientConfig: ${clientConfig}
`

func CreateCluster(namespace string, name string, region string) error {
	filename := clientcmd.NewDefaultClientConfigLoadingRules().GetDefaultFilename()
	data, err := os.ReadFile(filename)
	if err != nil {
		return err
	}

	bs64 := base64.StdEncoding.EncodeToString(data)

	baseapi.MustKubeApplyFromTemplate(clusterYaml, map[string]string{
		"name":         name,
		"namespace":    namespace,
		"region":       region,
		"clientConfig": bs64,
	})
	return nil
}

func GetCluster(namespace string, name string) (*v1.Cluster, error) {
	gvr := v1.GroupVersion.WithResource("clusters")
	cluster := &v1.Cluster{}
	if err := baseapi.GetObject(namespace, name, gvr, cluster); err != nil {
		return nil, err
	}

	return cluster, nil
}

func DeleteCluster(namespace string, name string) {
	baseapi.MustKubeDeleteFromTemplate(clusterYaml, map[string]string{
		"name":      name,
		"namespace": namespace,
	})
}
