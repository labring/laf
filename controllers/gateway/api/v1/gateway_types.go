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

// GatewaySpec defines the desired state of Gateway
type GatewaySpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Foo is an example field of Gateway. Edit gateway_types.go to remove/update

	// AppId是应用id，字母数字组成，长度5至16位，必须存在
	// +kubebuilder:validation:Pattern="^[a-zA-Z0-9]{5,16}$"
	// +kubebuilder:validation:Required
	AppId string `json:"appId"`

	// Buckets是存储桶, 是一个数组，可选存在
	// +kubebuilder:validation:Optional
	Buckets []string `json:"buckets,omitempty"`

	// Websites是静态站点，是一个数组，可选存在
	// +kubebuilder:validation:Optional
	Websites []string `json:"websites,omitempty"`
}

// GatewayStatus defines the observed state of Gateway
type GatewayStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// AppDomain 是应用域名，必须存在
	// +kubebuilder:validation:Required
	AppDomain string `json:"appDomain"`

	// BucketDomains 是存储桶域名列表，是一个数组，可选存在
	// +kubebuilder:validation:Optional
	BucketDomains []string `json:"bucketDomains,omitempty"`

	// WebsiteDomains 是静态站点域名列表，是一个数组，可选存在
	// +kubebuilder:validation:Optional
	WebsiteDomains []string `json:"websiteDomains,omitempty"`
}

// BucketDomain 是存储桶位的域名配置
type BucketDomain struct {
	// Name 是存储桶名称，必须存在
	// +kubebuilder:validation:Required
	Name string `json:"name"`

	// Domain 是存储桶域名，必须存在
	// +kubebuilder:validation:Required
	Domain string `json:"domain"`
}

// WebsiteDomain 是静态站点的域名配置
type WebsiteDomain struct {
	// Name 是静态站点名称，必须存在
	// +kubebuilder:validation:Required
	Name string `json:"name"`

	// Domain 是静态站点域名，必须存在
	// +kubebuilder:validation:Required
	Domain string `json:"domain"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Gateway is the Schema for the gateways API
type Gateway struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   GatewaySpec   `json:"spec,omitempty"`
	Status GatewayStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// GatewayList contains a list of Gateway
type GatewayList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Gateway `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Gateway{}, &GatewayList{})
}
