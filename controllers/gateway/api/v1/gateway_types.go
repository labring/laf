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

// BackendType 是后端服务类型
type BackendType string

const (
	APP     BackendType = "app"
	BUCKET  BackendType = "bucket"
	WEBSITE BackendType = "website"
)

// RouteState 是路由的状态
type RouteState string

const (
	PREPARING RouteState = "preparing"
	CREATED   RouteState = "created"
)

// GatewaySpec defines the desired state of Gateway
type GatewaySpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// +kubebuilder:validation:Required
	AppId string `json:"appid"`

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

	// AppRoute 是应用路由
	AppRoute *GatewayRoute `json:"appRoute,omitempty"`

	// BucketRoutes 是存储桶路由
	BucketRoutes map[string]*GatewayRoute `json:"bucketRoutes,omitempty"`

	// WebsiteRoutes 是静态站点路由
	WebsiteRoutes map[string]*GatewayRoute `json:"websiteRoutes,omitempty"`

	// Conditions
	// - Type: Ready
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

type GatewayRoute struct {
	// DomainName 是域名名称，必须存在
	// +kubebuilder:validation:Required
	DomainName string `json:"domainName"`

	// DomainNamespace 是域名所在的命名空间，必须存在
	// +kubebuilder:validation:Required
	DomainNamespace string `json:"domainNamespace"`

	// Domain 是域名，必须存在
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
