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
	applicationv1 "github.com/labring/laf/controllers/application/api/v1"
	runtimv1 "github.com/labring/laf/controllers/runtime/api/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// EDIT THIS FILE!  THIS IS SCAFFOLDING FOR YOU TO OWN!
// NOTE: json tags are required.  Any new fields you add must have json tags for the fields to be serialized.

type Quota struct {
	Cpu    resource.Quantity `json:"cpu,omitempty"`
	Memory resource.Quantity `json:"memory,omitempty"`
}

type InstanceState string

const (
	InstanceStateRunning InstanceState = "Running"
	InstanceStateStopped InstanceState = "Stopped"
)

const (
	ClusterSelected              string = "clusterSelected"
	DeploymentAndServiceCreated  string = "DeploymentAndServiceCreated"
	Ready                        string = "Ready"
	DeploymentAndServiceStopping string = "DeploymentAndServiceStopping"
	DeploymentAndServiceStopped  string = "DeploymentAndServiceStopped"
)

// InstanceSpec defines the desired state of Instance
type InstanceSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Region of the instance
	//+kubebuilder:validation:Required
	Region string `json:"region,omitempty"`

	// AppId of the instance
	//+kubebuilder:validation:Required
	AppId string `json:"appid,omitempty"`

	// Bundle of the instance
	//+kubebuilder:validation:Required
	Bundle applicationv1.BundleSpec `json:"bundle,omitempty"`

	// Runtime of the instance
	//+kubebuilder:validation:Required
	Runtime runtimv1.RuntimeSpec `json:"runtime,omitempty"`

	// Replica of instance
	//+kubebuilder:default=1
	Replica *int32 `json:"replica,omitempty"`

	// State of the instance
	//+kubebuilder:validation:Enum=Running;Stopped
	//+kubebuilder:validation:Required
	State InstanceState `json:"state,omitempty"`
}

// InstanceStatus defines the observed state of Instance
type InstanceStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	//ClusterName of instance
	ClusterName string `json:"clusterName,omitempty"`

	ClusterConfig ClientConfig `json:"clusterConfig,omitempty"`

	DeploymentName string `json:"DeploymentName,omitempty"`

	ServiceName string `json:"serviceName,omitempty"`

	Status InstanceState `json:"status,omitempty"`
	// Conditions of the instance
	// @see string for the list of conditions
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status
//+kubebuilder:resource:shortName=instance
//+kubebuilder:printcolumn:name="REGION",type=string,JSONPath=`.spec.region`
//+kubebuilder:printcolumn:name="STATUS",type=string,JSONPath=`.status.status`

// Instance is the Schema for the instances API
type Instance struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   InstanceSpec   `json:"spec,omitempty"`
	Status InstanceStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// InstanceList contains a list of Instance
type InstanceList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Instance `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Instance{}, &InstanceList{})
}
