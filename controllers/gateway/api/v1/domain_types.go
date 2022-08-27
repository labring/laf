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

// DomainSpec defines the desired state of Domain
type DomainSpec struct {

	// Preferred 是提供域名使用位置的推荐项，是字符串类型，长度大于1小于10，必须存在
	// +kubebuilder:validation:MinLength=1
	// +kubebuilder:validation:MaxLength=10
	// +kubebuilder:validation:Required
	Preferred string `json:"preferred"`

	// Region 是域名设定的解析区域，是字符串类型，长度大于1小于10，可选存在
	// +kubebuilder:validation:MinLength=1
	// +kubebuilder:validation:MaxLength=10
	// +kubebuilder:validation:Optional
	Region string `json:"region,omitempty"`

	// Domain 是域名，是字符串类型，规则匹配域名规则，必须存在
	// +kubebuilder:validation:Pattern="^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}$"
	// +kubebuilder:validation:Required
	Domain string `json:"domain"`

	// CertConfigRef 是字符串类型，是configMap的引用
	// +kubebuilder:validation:Required
	CertConfigRef string `json:"certConfigRef"`
}

// DomainStatus defines the observed state of Domain
type DomainStatus struct {
	// CertConfigRef 是字符串类型，是configMap的引用
	// +kubebuilder:validation:Required
	CertConfigRef string `json:"certConfigRef"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Domain is the Schema for the domains API
type Domain struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   DomainSpec   `json:"spec,omitempty"`
	Status DomainStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// DomainList contains a list of Domain
type DomainList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Domain `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Domain{}, &DomainList{})
}
