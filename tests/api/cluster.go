package api

import (
	"context"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"laf/pkg/common"
)

func InitCluster(client *kubernetes.Clientset) {
	// create laf system namespace
	EnsureSystemNamespace()
}

func CleanCluster(client *kubernetes.Clientset) {
	DeleteSystemNamespace(client)
}

func DeleteSystemNamespace(client *kubernetes.Clientset) {
	name := common.GetSystemNamespace()

	err := client.CoreV1().Namespaces().Delete(context.TODO(), name, metav1.DeleteOptions{})
	if err != nil {
		panic(err.Error())
	}
}

func EnsureSystemNamespace() *v1.Namespace {
	name := common.GetSystemNamespace()
	client := GetDefaultKubernetesClient()
	ns, err := client.CoreV1().Namespaces().Get(context.TODO(), name, metav1.GetOptions{})
	if err != nil {
		return CreateNamespace(client, name)
	}

	return ns
}
