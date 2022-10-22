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

// CreationFormSpec defines the desired state of CreationForm
type CreationFormSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Region
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:MinLength=3
	//+kubebuilder:validation:MaxLength=24
	Region string `json:"region"`

	// DisplayName for the application
	//+kubebuilder:validation:MinLength=3
	//+kubebuilder:validation:MaxLength=63
	//+kubebuilder:validation:Required
	DisplayName string `json:"displayName"`

	// Bundle Name for the application
	//+kubebuilder:validation:Required
	BundleName string `json:"bundleName"`

	// RuntimeSpec Name of the application
	//+kubebuilder:validation:Required
	RuntimeName string `json:"runtimeName"`
}

// CreationFormStatus defines the observed state of CreationForm
type CreationFormStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	AppId string `json:"appid,omitempty"`

	Namespace string `json:"namespace,omitempty"`

	Created bool `json:"created,omitempty"`

	// Conditions
	// - Type: Validated
	// - Type: ValidRuntime
	// - Type: ValidBundle
	// - Type: Created
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// CreationForm is the Schema for the creationforms API
type CreationForm struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   CreationFormSpec   `json:"spec,omitempty"`
	Status CreationFormStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// CreationFormList contains a list of CreationForm
type CreationFormList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []CreationForm `json:"items"`
}

func init() {
	SchemeBuilder.Register(&CreationForm{}, &CreationFormList{})
}
