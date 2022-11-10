/*
Copyright 2022.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package v1

import (
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// EDIT THIS FILE!  THIS IS SCAFFOLDING FOR YOU TO OWN!
// NOTE: json tags are required.  Any new fields you add must have json tags for the fields to be serialized.

// Capacity defines the capacity
type Capacity struct {
	// The storage space.
	//+optional
	CPU resource.Quantity `json:"cpu,omitempty"`

	// The number of databases. The default value is 0 which means unlimited.
	//+optional
	Memory resource.Quantity `json:"memory,omitempty"`
}

type ClientConfig struct {
	//+kubebuilder:validation:Required
	CertificateAuthorityData string `json:"certificateAuthorityData,omitempty"`

	//+kubebuilder:validation:Required
	Server string `json:"server,omitempty"`

	//+kubebuilder:validation:Required
	UserClientCertificateData string `json:"userClientCertificateData,omitempty"`

	//+kubebuilder:validation:Required
	UserClientKeyData string `json:"userClientKeyData,omitempty"`
}

// ClusterSpec defines the desired state of Cluster
type ClusterSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Region of the cluster
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:MinLength=2
	//+kubebuilder:validation:MaxLength=64
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:Pattern=^[a-z0-9-]+$
	Region string `json:"region,omitempty"`

	// ClientConfig of the cluster (e.g. kubeconfig)
	//+kubebuilder:validation:Required
	ClientConfig string `json:"clientConfig,omitempty"`

	// The capacity of the cluster.
	//+optional
	Capacity *Capacity `json:"capacity,omitempty"`
}

// ClusterStatus defines the observed state of Cluster
type ClusterStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// The capacity of the cluster.
	//+optional
	Used *Capacity `json:"used,omitempty"`

	InstanceCount int `json:"instanceCount,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Cluster is the Schema for the clusters API
type Cluster struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ClusterSpec   `json:"spec,omitempty"`
	Status ClusterStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// ClusterList contains a list of Cluster
type ClusterList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Cluster `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Cluster{}, &ClusterList{})
}
