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

type RuntimeImageGroup struct {
	// Main image
	Main string `json:"main"`

	// Sidecar image
	Sidecar string `json:"sidecar,omitempty"`

	// Init image
	Init string `json:"init,omitempty"`
}

type RuntimeVersion struct {
	// Version is the version of the runtime
	Version string `json:"version,omitempty"`

	// Version that is breaking from
	BreakBefore string `json:"breakBefore,omitempty"`

	// Versions that suggested to upgrade from
	UpgradeFrom []string `json:"upgradeFrom,omitempty"`

	// Versions that should auto upgrade from
	AutoUpgradeFrom []string `json:"autoUpgradeFrom,omitempty"`

	// Versions that must upgrade from
	MustUpgradeFrom []string `json:"mustUpgradeFrom,omitempty"`
}

// RuntimeSpec defines the desired state of Runtime
type RuntimeSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Type of the runtime. eg. node:laf, node:tcb, go:laf, python:laf, php:laf,  etc.
	Type string `json:"type"`

	// Images of the runtime
	Image RuntimeImageGroup `json:"image"`

	// Version of the runtime
	Version RuntimeVersion `json:"versions"`

	// Deprecated
	Deprecated bool `json:"deprecated,omitempty"`
}

// RuntimeStatus defines the observed state of Runtime
type RuntimeStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// App count of the runtime
	AppCount int `json:"appCount,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Runtime is the Schema for the runtimes API
type Runtime struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   RuntimeSpec   `json:"spec,omitempty"`
	Status RuntimeStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// RuntimeList contains a list of Runtime
type RuntimeList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Runtime `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Runtime{}, &RuntimeList{})
}
