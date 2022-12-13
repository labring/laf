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

// RouteSpec defines the desired state of Route
type RouteSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// +kubebuilder:validation:Required
	Domain string `json:"domain"`

	// +kubebuilder:validation:Required
	Backend Backend `json:"backend"`

	// +kubebuilder:validation:Required
	DomainName string `json:"domainName"`

	// +kubebuilder:validation:Required
	DomainNamespace string `json:"domainNamespace"`

	// +kubebuilder:validation:Optional
	CertConfigRef string `json:"certConfigRef,omitempty"`

	// +kubebuilder:validation:Optional
	PathRewrite *PathRewrite `json:"pathRewrite,omitempty"`

	// +kubebuilder:validation:Optional
	PassHost string `json:"passHost,omitempty"`

	// +kubebuilder:validation:Optional
	EnableWebSocket bool `json:"enableWebSocket,omitempty"`
}

type PathRewrite struct {
	// +kubebuilder:validation:Required
	Regex string `json:"regex"`

	// +kubebuilder:validation:Required
	Replacement string `json:"replacement"`
}

// RouteStatus defines the observed state of Route
type RouteStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// +kubebuilder:validation:Required
	Domain string `json:"Domain"`

	// +kubebuilder:validation:Required
	SupportSSL bool `json:"supportSSL"`
}

// Backend defines the desired state of Backend
type Backend struct {

	// +kubebuilder:validation:Required
	ServiceName string `json:"serviceName"`

	// +kubebuilder:validation:Required
	ServicePort int32 `json:"servicePort"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Route is the Schema for the routes API
type Route struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   RouteSpec   `json:"spec,omitempty"`
	Status RouteStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// RouteList contains a list of Route
type RouteList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Route `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Route{}, &RouteList{})
}
