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

// CloudFunctionSpec defines the desired state of CloudFunction
type CloudFunctionSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Name of function
	Name string `json:"name"`

	// Description of function
	Description string `json:"description"`

	// WebSocket enabled, defaults to false
	//+kubebuilder:default:=false
	WebSocketEnabled bool `json:"webSocketEnabled"`

	// Allowed HTTP methods. If empty, http access is disabled.
	// The value of this field can be any one or a combination of the following:
	//	GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, CONNECT, TRACE.
	// The default values are: ["GET", "POST", "PUT", "DELETE"].
	AllowedHTTPMethods []string `json:"allowedHTTPMethods"`

	// Code for the function
	Code string `json:"code"`

	// Compiled code for the function
	CompiledCode string `json:"compiledCode"`

	// Version of the function
	Version int64 `json:"version"`
}

// CloudFunctionStatus defines the observed state of CloudFunction
type CloudFunctionStatus struct {
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

// CloudFunction is the Schema for the cloudfunctions API
type CloudFunction struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   CloudFunctionSpec   `json:"spec,omitempty"`
	Status CloudFunctionStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// CloudFunctionList contains a list of CloudFunction
type CloudFunctionList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []CloudFunction `json:"items"`
}

func init() {
	SchemeBuilder.Register(&CloudFunction{}, &CloudFunctionList{})
}
