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

// DatabaseSpec defines the desired state of Database
type DatabaseSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Provider name of the database.
	// The controller will create the corresponding storage resources based on this provider.
	//+kubebuilder:validation:Required
	Provider string `json:"provider"`

	// Region of oss store. It's read-only after creation.
	// The controller will create the corresponding storage resources based on this region.
	//+kubebuilder:validation:Required
	Region string `json:"region"`

	// Capacity desired.
	//+kubebuilder:validation:Required
	Capacity DatabaseCapacity `json:"capacity"`
}

// DatabaseStatus defines the observed state of Database
type DatabaseStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Store name of this database.
	// The controller has created the corresponding storage resources based on this store.
	//+kubebuilder:validation:Required
	Store string `json:"store,omitempty"`

	// Region name identifies the location of the store.
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:MinLength=2
	//+kubebuilder:validation:MaxLength=64
	//+kubebuilder:default=default
	//+kubebuilder:validation:Pattern=[a-zA-Z0-9-]+
	Region string `json:"region,omitempty"`

	// ConnectionURI of the database.
	ConnectionURI string `json:"connectionURI"`

	// Capacity observed by the controller
	Capacity DatabaseCapacity `json:"capacity,omitempty"`
}

type DatabaseCapacity struct {
	// The storage space of database. The unit is MB.
	// The default value is 0 which means unlimited.
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:default=0
	//+optional
	Storage int64 `json:"storage,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Database is the Schema for the databases API
type Database struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   DatabaseSpec   `json:"spec,omitempty"`
	Status DatabaseStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// DatabaseList contains a list of Database
type DatabaseList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Database `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Database{}, &DatabaseList{})
}
