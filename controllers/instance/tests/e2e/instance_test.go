package e2e

import (
	baseapi "github.com/labring/laf/tests/api"
	"github/labring/laf/controllers/instance/tests/api"
	"testing"
)

func TestCreateInstance(t *testing.T) {
	const namespace = "testing-instance-namespace"
	const name = "testing-instance"
	const region = "testing-instance-region"
	const appId = "test-instance-appId"

	t.Run("create cluster starting", func(t *testing.T) {
		t.Log("ensure namespace")
		baseapi.EnsureNamespace(namespace)

		t.Log("get your local kube config")
		//filename := clientcmd.NewDefaultClientConfigLoadingRules().GetDefaultFilename()
		//kubeconfig, err := os.ReadFile(filename)
		//if err != nil {
		//	t.Errorf("makesure your local kube config is exist,%v", err)
		//}
		t.Logf("create a cluster")
		api.CreateCluster(namespace, name, region)

		t.Log("verify the cluster is created")
		cluster, err := api.GetCluster(namespace, name)
		if err != nil {
			t.Fatalf("failed to get cluster: %v", err)
		}

		if cluster.Name != name {
			t.Fatalf("failed to create cluster")
		}

		t.Log("create a instance")
		api.CreateInstance(namespace, name, region, appId, "Running")
	})
	t.Cleanup(func() {
		t.Log("clean up cluster")
		//api.DeleteCluster(namespace, name)

	})
}
