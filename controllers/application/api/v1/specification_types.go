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
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// EDIT THIS FILE!  THIS IS SCAFFOLDING FOR YOU TO OWN!
// NOTE: json tags are required.  Any new fields you add must have json tags for the fields to be serialized.

// SpecificationSpec defines the desired state of Specification
type SpecificationSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// DisplayName for the specification
	DisplayName string `json:"displayName"`

	// Request CPU for the specification
	RequestCPU int32 `json:"requestCPU"`

	// Request Memory for the specification
	RequestMemory int64 `json:"requestMemory"`

	// Limit CPU for the specification
	LimitCPU int32 `json:"limitCPU"`

	// Limit Memory for the specification
	LimitMemory int64 `json:"limitMemory"`

	// Database capacity for the specification
	DatabaseCapacity int64 `json:"databaseCapacity"`

	// Storage capacity for the specification
	StorageCapacity int64 `json:"storageCapacity"`

	// Network Bandwidth Outbound for the specification
	NetworkBandwidthOutbound int64 `json:"networkBandwidthOutbound"`

	// Network Bandwidth Inbound for the specification
	NetworkBandwidthInbound int64 `json:"networkBandwidthInbound"`

	// Network Traffic Outbound for the specification
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:validation:Default=0
	NetworkTrafficOutbound int64 `json:"networkTrafficOutbound"`

	// Priority for the specification.
	// The default value is 0, which means that the specification is not currently available for creating new applications.
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:validation:Maximum=100
	//+kubebuilder:validation:Default=0
	Priority int32 `json:"priority"`
}

// SpecificationStatus defines the observed state of Specification
type SpecificationStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Specification is the Schema for the specifications API
type Specification struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   SpecificationSpec   `json:"spec,omitempty"`
	Status SpecificationStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// SpecificationList contains a list of Specification
type SpecificationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Specification `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Specification{}, &SpecificationList{})
}
