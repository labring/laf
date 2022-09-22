package api

import (
	"context"
	"fmt"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
	"os"
	"os/exec"
	"path/filepath"
	//
	// Uncomment to load all auth plugins
	_ "k8s.io/client-go/plugin/pkg/client/auth"
	//
	// Or uncomment to load specific auth plugins
	// _ "k8s.io/client-go/plugin/pkg/client/auth/azure"
	// _ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	// _ "k8s.io/client-go/plugin/pkg/client/auth/oidc"
)

// GetDefaultKubernetesClient returns a kubernetes client
func GetDefaultKubernetesClient() *kubernetes.Clientset {
	kubeconfig := GetDefaultKubeConfigPath()

	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		panic(err.Error())
	}

	// create the client
	client, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	return client
}

func GetDefaultKubeConfigPath() string {
	// get the value of the environment variable KUBE_CONFIG_FILE
	kubeconfig := os.Getenv("KUBE_CONFIG_FILE")
	if kubeconfig == "" {
		// if KUBECONFIG is not set, use the default location
		kubeconfig = filepath.Join(homedir.HomeDir(), ".kube", "config")
	}

	return kubeconfig
}

func GetDefaultDynamicClient() dynamic.Interface {
	kubeconfig := GetDefaultKubeConfigPath()

	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		panic(err.Error())
	}

	// create the client
	client, err := dynamic.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	return client
}

func GetNodeAddress() string {
	// get the address from env variable first: NODE_ADDRESS
	nodeAddress := os.Getenv("NODE_ADDRESS")
	if nodeAddress != "" {
		return nodeAddress
	}

	client := GetDefaultKubernetesClient()
	nodes, err := client.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		panic(err.Error())
	}
	return nodes.Items[0].Status.Addresses[0].Address
}

func CreateNamespace(client *kubernetes.Clientset, name string) *v1.Namespace {
	ns := &v1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
			Labels: map[string]string{
				"laf.dev/testing": "testing",
			},
		},
	}

	result, err := client.CoreV1().Namespaces().Create(context.TODO(), ns, metav1.CreateOptions{})
	if err != nil {
		panic(err.Error())
	}

	return result
}

func Exec(command string) (string, error) {
	cmd := exec.Command("sh", "-c", command)
	out, err := cmd.Output()
	if err != nil {
		fmt.Println(err, cmd)
		return string(out), err
	}
	return string(out), nil
}

func KubeApply(yaml string) (string, error) {
	cmd := `kubectl apply -f - <<EOF` + yaml + `EOF`
	out, err := Exec(cmd)
	if err != nil {
		return out, err
	}

	return out, nil
}

func KubeDelete(yaml string) (string, error) {
	cmd := `kubectl delete -f - <<EOF` + yaml + `EOF`
	out, err := Exec(cmd)
	if err != nil {
		return out, err
	}

	return out, nil
}
