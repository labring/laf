package api

import (
	"context"
	gonanoid "github.com/matoous/go-nanoid/v2"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"strings"
	"testing"
)

func TestGetCurrentKubernetesClient(t *testing.T) {

	t.Run("get client should be ok", func(t *testing.T) {
		client := GetDefaultKubernetesClient()
		if client == nil {
			t.FailNow()
		}

		nodes, err := client.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
		if err != nil {
			t.FailNow()
		}

		if len(nodes.Items) == 0 {
			t.FailNow()
		}
	})
}

func TestGetNodeAddress(t *testing.T) {
	t.Run("get node address should be ok", func(t *testing.T) {
		addr := GetNodeAddress()

		if addr == "" {
			t.FailNow()
		}
	})
}

func TestExecCommand(t *testing.T) {
	t.Run("exec command should be ok", func(t *testing.T) {
		_, err := Exec("ls")
		if err != nil {
			t.FailNow()
		}
	})

	t.Run("exec complex command should be ok", func(t *testing.T) {
		// random name
		name := "testing-" + gonanoid.MustGenerate("0123456789abcdefghijklmnopqrstuvwxyz", 8)
		cmd := `
kubectl apply -f - << EOF
apiVersion: v1
kind: Namespace
metadata:
  name: ${name}
EOF
`
		cmd = strings.ReplaceAll(cmd, "${name}", name)
		_, err := Exec(cmd)
		if err != nil {
			t.FailNow()
		}

		defer Exec("kubectl delete namespace " + name)

		// check if namespace exists
		client := GetDefaultKubernetesClient()
		_, err = client.CoreV1().Namespaces().Get(context.TODO(), name, metav1.GetOptions{})
		if err != nil {
			t.Error(err.Error())
			t.FailNow()
		}
	})
}
