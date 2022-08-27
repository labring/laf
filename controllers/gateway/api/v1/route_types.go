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

	// RouteType 是路由类型, 必须存在，且只能是下面的值之一 oss、website、app
	// +kubebuilder:validation:Enum=oss;website;app
	// +kubebuilder:validation:Required
	RouteType string `json:"routeType"`

	// AppId 是应用Id，必须存在，长度3到10之间，由字母和数字组合
	// +kubebuilder:validation:MinLength=3
	// +kubebuilder:validation:MaxLength=10
	// +kubebuilder:validation:Pattern="^[a-zA-Z0-9]*$"
	// +kubebuilder:validation:Required
	AppId string `json:"appid"`

	// Domain 是自定义域名，非必须存在，需要匹配域名规则
	// +kubebuilder:validation:Pattern="^[a-zA-Z0-9]*$"
	Domain string `json:"domain,omitempty"`

	// Upstream是上游服务
	Upstream Upstream `json:"upstream"`
}

// RouteStatus defines the observed state of Route
type RouteStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// FullDomain 是路由的完整域名，必须存在
	// +kubebuilder:validation:Required
	FullDomain string `json:"fullDomain"`
}

// Upstream defines the desired state of Upstream
type Upstream struct {

	// Nodes 是节点列表，必须存在，至少有一个节点, 每个节点是个key-value对，key是节点名称，value是节点权重
	// +kubebuilder:validation:MinItems=1
	// +kubebuilder:validation:Required
	Nodes []map[string]int32 `json:"nodes"`
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
