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

// ApplicationState defines the state of the application
type ApplicationState string

const (
	ApplicationStateCreated   ApplicationState = "Created"
	ApplicationStateStarted   ApplicationState = "Started"
	ApplicationStateStopped   ApplicationState = "Stopped"
	ApplicationStateRunning   ApplicationState = "Running"
	ApplicationStateRestarted ApplicationState = "Restarted"
	ApplicationStateDeleted   ApplicationState = "Deleted"
)

// ApplicationSpec defines the desired state of Application
type ApplicationSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// DisplayName for the application
	//+kubebuilder:validation:MinLength=3
	//+kubebuilder:validation:MaxLength=63
	//+kubebuilder:validation:Required
	DisplayName string `json:"displayName"`

	// State of the application
	//+kubebuilder:validation:Enum=Created;Started;Stopped;Running;Restarted;Deleted
	//+kubebuilder:validation:Required
	//+kubebuilder:default:=Created
	State ApplicationState `json:"state"`

	// Specification Name for the application
	//+kubebuilder:validation:Required
	SpecificationName string `json:"specificationName"`

	// Runtime Name of the application
	//+kubebuilder:validation:Required
	RuntimeName string `json:"runtimeName"`
}

// ApplicationStatus defines the observed state of Application
type ApplicationStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Appid
	//+kubebuilder:validation:MinLength=3
	//+kubebuilder:validation:MaxLength=16
	//+kubebuilder:validation:Required
	Appid string `json:"appid"`

	// Specification for the application
	Specification SpecificationSpec `json:"specification"`

	// State of the application
	State ApplicationState `json:"state"`

	// Runtime for the application
	Runtime RuntimeSpec `json:"runtime"`
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
