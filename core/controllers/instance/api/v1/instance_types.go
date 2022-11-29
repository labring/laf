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
	DeploymentAndServiceCreating string = "DeploymentAndServiceCreating"
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
	Bundle string `json:"bundle,omitempty"`

	//+kubebuilder:validation:Required
	BundleNamespace string `json:"bundleNamespace,omitempty"`

	// Runtime of the instance
	//+kubebuilder:validation:Required
	RuntimeName string `json:"runtime,omitempty"`

	//+kubebuilder:validation:Required
	RuntimeNamespace string `json:"runtimeNamespace,omitempty"`

	// Database of the instance
	//+kubebuilder:validation:Required
	Database string `json:"database,omitempty"`

	//+kubebuilder:validation:Required
	DatabaseNamespace string `json:"databaseNamespace,omitempty"`

	// OssUser of the instance
	//+kubebuilder:validation:Required
	OssUser string `json:"ossUser,omitempty"`

	//+kubebuilder:validation:Required
	OssUserNamespace string `json:"ossUserNamespace,omitempty"`

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

	ClusterConfig string `json:"clusterConfig,omitempty"`

	DeploymentName string `json:"DeploymentName,omitempty"`

	ServiceName string `json:"serviceName,omitempty"`

	Status InstanceState `json:"status,omitempty"`

	Replicas int32 `json:"replicas,omitempty" protobuf:"varint,2,opt,name=replicas"`

	// Total number of non-terminated pods targeted by this deployment that have the desired template spec.
	// +optional
	UpdatedReplicas int32 `json:"updatedReplicas,omitempty" protobuf:"varint,3,opt,name=updatedReplicas"`

	// readyReplicas is the number of pods targeted by this Deployment with a Ready Condition.
	// +optional
	ReadyReplicas int32 `json:"readyReplicas,omitempty" protobuf:"varint,7,opt,name=readyReplicas"`

	// Total number of available pods (ready for at least minReadySeconds) targeted by this deployment.
	// +optional
	AvailableReplicas int32 `json:"availableReplicas,omitempty" protobuf:"varint,4,opt,name=availableReplicas"`

	// Total number of unavailable pods targeted by this deployment. This is the total number of
	// pods that are still required for the deployment to have 100% available capacity. They may
	// either be pods that are running but not yet available or pods that still have not been created.
	// +optional
	UnavailableReplicas int32 `json:"unavailableReplicas,omitempty" protobuf:"varint,5,opt,name=unavailableReplicas"`

	// Conditions of the instance
	// @see string for the list of conditions
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status
//+kubebuilder:resource:shortName=instance
//+kubebuilder:printcolumn:name="REGION",type=string,JSONPath=`.spec.region`
//+kubebuilder:printcolumn:name="STATUS",type=string,JSONPath=`.status.status`
//+kubebuilder:printcolumn:name="READY",type=string,JSONPath=`.status.readyReplicas`
//+kubebuilder:printcolumn:name="UP-TO-DATE",type=string,JSONPath=`.status.updatedReplicas`
//+kubebuilder:printcolumn:name="AVAILABLE",type=string,JSONPath=`.status.availableReplicas`
//+kubebuilder:printcolumn:name="UNAVAILABLE",type=string,JSONPath=`.status.unavailableReplicas`

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
