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

	// Domain是域名，必须存在，匹配域名规则
	// +kubebuilder:validation:Pattern="^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}$"
	// +kubebuilder:validation:Required
	Domain string `json:"domain"`

	// BackendType是后端服务类型，必须存在APP;bucket;WEBSITE
	// +kubebuilder:validation:Enum=app;bucket;website
	// +kubebuilder:validation:Required
	BackendType BackendType `json:"backendType"`

	// Region 是区域 必须存在 由字符数组和-组成
	// +kubebuilder:validation:Pattern="^[a-zA-Z0-9-]+$"
	// +kubebuilder:validation:Required
	Region string `json:"region"`

	// Cluster 是网关集群配置 必须存在
	// +kubebuilder:validation:Required
	Cluster ClusterSpec `json:"cluster"`

	// CertConfigRef 是字符串类型，是configMap的引用，可选存在
	// +kubebuilder:validation:Optional
	CertConfigRef string `json:"certConfigRef"`
}

// ClusterSpec 是集群的规格
type ClusterSpec struct {
	// url是集群的url，必须存在
	Url string `json:"url"`

	// key是集群的key，必须存在
	Key string `json:"key"`
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
