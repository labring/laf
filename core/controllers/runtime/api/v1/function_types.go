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

// FunctionState Enum
type FunctionState string

const (
	FunctionStateDeployed FunctionState = "Deployed"
)

// FunctionSource supports three storage methods: inline, Git repository, and database. The latter two are specified by URI.
type FunctionSource struct {
	// Source codes of the function
	Codes string `json:"codes,omitempty"`

	// Codes uri of the function
	URI string `json:"uri,omitempty"`

	// Version of the function
	//+kubebuilder:default:=0
	Version int64 `json:"version"`
}

// FunctionSpec defines the desired state of Function
type FunctionSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Description of function
	Description string `json:"description"`

	// Websocket enabled, defaults to false
	//+kubebuilder:default:=false
	Websocket bool `json:"websocket"`

	// Allowed HTTP methods. If empty, http access is disabled.
	// The value of this field can be any one or a combination of the following:
	//	GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, CONNECT, TRACE.
	// The default values are: ["GET", "POST", "PUT", "DELETE"]. If the value is "*", all methods are allowed.
	Methods []string `json:"methods"`

	// Function source
	Source FunctionSource `json:"source"`
}

// FunctionStatus defines the observed state of Function
type FunctionStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// State of the function
	//+kubebuilder:validation:Enum=Deployed
	//+kubebuilder:validation:Required
	//+kubebuilder:default:=Deployed
	State FunctionState `json:"state"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Function is the Schema for the functions API
type Function struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   FunctionSpec   `json:"spec,omitempty"`
	Status FunctionStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// FunctionList contains a list of Function
type FunctionList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Function `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Function{}, &FunctionList{})
}
