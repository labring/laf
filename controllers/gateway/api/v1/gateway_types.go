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

	// appid 是应用id，由字符和数字组成，长度为3-10个字符或者数字，必须存在
	// +kubebuilder:validation:MinLength=3
	// +kubebuilder:validation:MaxLength=10
	// +kubebuilder:validation:Pattern="^[a-zA-Z0-9]*$"
	// +kubebuilder:validation:Required
	AppId string `json:"appid"`

	CustomDomain []CustomDomainSpec `json:"customDomain,omitempty"`
}

// GatewayStatus defines the observed state of Gateway
type GatewayStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	//Schema 是协议，必须存在，目前只支持http和https
	// +kubebuilder:validation:Enum=http;https
	// +kubebuilder:validation:Required
	Schema string `json:"schema"`

	// FullAppDomain 是应用的完整域名
	FullAppDomain string `json:"fullAppDomain,omitempty"`

	// FullOssDomain 是应用的完整oss域名
	FullOssDomain string `json:"fullOssDomain,omitempty"`

	// CustomDomain 是服务的自定义域名
	CustomDomain []CustomDomainStatus `json:"customDomain,omitempty"`
}

// CustomDomainSpec defines the desired state of CustomDomain
type CustomDomainSpec struct {

	// DomainType 是域名类型，支持app和oss, 必须传入
	// +kubebuilder:validation:Enum=app;oss
	// +kubebuilder:validation:Required
	DomainType string `json:"domainType"`

	// Domain 是自定义域名，必须存在
	// +kubebuilder:validation:Required
	Domain string `json:"domain"`

	// Schema 是协议，必须存在，只能为http或者https
	// +kubebuilder:validation:Enum=http;https
	// +kubebuilder:validation:Required
	Schema string `json:"schema"`

	// CertFile 是证书文件
	CertFile CertFile `json:"certFile,omitempty"`
}

// CustomDomainStatus 是自定义域名状态
type CustomDomainStatus struct {

	// DomainType 是域名类型，支持app和oss, 必须传入
	// +kubebuilder:validation:Enum=app;oss
	// +kubebuilder:validation:Required
	DomainType string `json:"domainType"`

	// Domain 是自定义域名，必须存在
	// +kubebuilder:validation:Required
	Domain string `json:"domain"`

	// Schema 是协议，必须存在，只能为http或者https
	// +kubebuilder:validation:Enum=http;https
	// +kubebuilder:validation:Required
	Schema string `json:"schema"`

	// Status是状态，必须存在
	// +kubebuilder:validation:Required
	Status string `json:"status"`
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
