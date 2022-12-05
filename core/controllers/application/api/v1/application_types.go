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

// ApplicationState defines the state of the application
type ApplicationState string

const (
	ApplicationStateInitializing ApplicationState = "Initializing"
	ApplicationStateInitialized  ApplicationState = "Initialized"
	ApplicationStateStarting     ApplicationState = "Starting"
	ApplicationStateRunning      ApplicationState = "Running"
	ApplicationStateStopping     ApplicationState = "Stopping"
	ApplicationStateStopped      ApplicationState = "Stopped"
)

const (
	DatabaseCreated      string = "DatabaseCreated"
	ObjectStorageCreated string = "ObjectStorageCreated"
	GatewayCreated       string = "GatewayCreated"

	DatabaseReady      string = "DatabaseReady"
	ObjectStorageReady string = "ObjectStorageReady"
	GatewayReady       string = "GatewayReady"

	Ready           string = "Ready"
	InstanceCreated string = "InstanceCreated"
	InstanceDeleted string = "InstanceDeleted"

	DatabaseDeleted      string = "DatabaseDeleted"
	ObjectStorageDeleted string = "ObjectStorageDeleted"
	GatewayDeleted       string = "GatewayDeleted"
)

// Bundle defines the desired state of Bundle
type Bundle struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// DisplayName for the bundle
	DisplayName string `json:"displayName"`

	// Request CPU for the bundle
	RequestCPU resource.Quantity `json:"requestCPU"`

	// Request Memory for the bundle
	RequestMemory resource.Quantity `json:"requestMemory"`

	// Limit CPU for the bundle
	LimitCPU resource.Quantity `json:"limitCPU"`

	// Limit Memory for the bundle
	LimitMemory resource.Quantity `json:"limitMemory"`

	// Database capacity for the bundle
	DatabaseCapacity resource.Quantity `json:"databaseCapacity"`

	// Storage capacity for the bundle
	StorageCapacity resource.Quantity `json:"storageCapacity"`

	// Network Bandwidth Outbound for the bundle
	NetworkBandwidthOutbound resource.Quantity `json:"networkBandwidthOutbound,omitempty"`

	// Network Bandwidth Inbound for the bundle
	NetworkBandwidthInbound resource.Quantity `json:"networkBandwidthInbound,omitempty"`

	// Network Traffic Outbound for the bundle
	NetworkTrafficOutbound resource.Quantity `json:"networkTrafficOutbound"`
}

// ApplicationSpec defines the desired state of Application
type ApplicationSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// AppId
	//+kubebuilder:validation:MinLength=3
	//+kubebuilder:validation:MaxLength=24
	//+kubebuilder:validation:Required
	AppId string `json:"appid"`

	// Region
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:MinLength=3
	//+kubebuilder:validation:MaxLength=24
	Region string `json:"region"`

	// State of the application
	//+kubebuilder:validation:Enum=Running;Stopped;
	//+kubebuilder:validation:Required
	//+kubebuilder:default:=Running
	State ApplicationState `json:"state,omitempty"`

	// Bundle of the application
	Bundle Bundle `json:"bundle"`
}

// ApplicationStatus defines the observed state of Application
type ApplicationStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// State of the application
	Phase ApplicationState `json:"state,omitempty"`

	// Conditions:
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Application is the Schema for the applications API
type Application struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ApplicationSpec   `json:"spec,omitempty"`
	Status ApplicationStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// ApplicationList contains a list of Application
type ApplicationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Application `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Application{}, &ApplicationList{})
}
