package e2e

import (
	instancev1 "github/labring/laf/core/controllers/instance/api/v1"
	"github/labring/laf/core/controllers/instance/tests/api"
	"testing"

	baseapi "github.com/labring/laf/core/tests/api"
)

func TestCreateInstance(t *testing.T) {
	const namespace = "testing-instance-namespace"
	const instanceName = "testing-instance"
	const clusterName = "testing-cluster"
	const region = "testing-instance-region"
	const appId = "test-instance-appId"

	t.Run("create cluster starting", func(t *testing.T) {
		t.Log("ensure namespace")
		baseapi.EnsureNamespace(namespace)

		t.Log("get your local kube config")

		t.Logf("create a cluster")
		api.CreateCluster(namespace, clusterName, region)

		t.Log("verify the cluster is created")
		cluster, err := api.GetCluster(namespace, clusterName)
		if err != nil {
			t.Fatalf("failed to get cluster: %v", err)
		}

		if cluster.Name != clusterName {
			t.Fatalf("failed to create cluster")
		}

		expect := instancev1.InstanceStateRunning
		t.Log("create a instance")
		api.CreateInstance(namespace, instanceName, region, appId, string(expect))

		t.Log("waiting for the instance ready")
		api.WaitForInstanceReady(namespace, instanceName)

		t.Log("check instance status ")
		instance, err := api.GetInstance(namespace, instanceName)
		if err != nil {
			t.Fatalf("failed to get instance: %v", err)
		}
		if instance.Status.Status != expect {
			t.Fatalf("instance current statue is [%s], not [%s]", instance.Status.Status, expect)
		}
		expect = instancev1.InstanceStateStopped

		//t.Log("delete instance")
		//api.StopInstance(namespace, instanceName, region, appId, string(expect))
		//t.Log("waiting for the instance ready")
		//api.WaitForInstanceReady(namespace, instanceName)
	})
	t.Cleanup(func() {
		t.Log("clean up")
		api.DeleteCluster(namespace, clusterName)
		api.DeleteInstance(namespace, instanceName)
	})
}
