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

// StoreCapacity defines the capacity of a store.
type StoreCapacity struct {
	// The user count of a store.
	//+optional
	UserCount int64 `json:"userCount,omitempty"`

	// The storage space. The unit is MB.
	// The default value is 0 which means unlimited.
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:default=0
	//+optional
	Storage int64 `json:"storage,omitempty"`

	// The number of databases. The default value is 0 which means unlimited.
	//+optional
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:default=0
	DatabaseCount int64 `json:"databaseCount,omitempty"`

	// The number of collections. The default value is 0 which means unlimited.
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:default=0
	//+optional
	CollectionCount int64 `json:"collectionCount,omitempty"`
}

// StoreSpec defines the desired state of Store
type StoreSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// The region of the store, defaults to "default".
	//+kubebuilder:validation:MinLength=2
	//+kubebuilder:validation:MaxLength=64
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:Pattern=^[a-z0-9-]+$
	//+kubebuilder:default=default
	Region string `json:"region"`

	// The provider of the store, defaults to "mongodb".
	//+kubebuilder:validation:MinLength=2
	//+kubebuilder:validation:MaxLength=64
	//+kubebuilder:validation:Required
	//+kubebuilder:default=mongodb
	Provider string `json:"provider"`

	// The connection uri of the store.
	//+kubebuilder:validation:Required
	ConnectionURI string `json:"connectionURI"`

	// The capacity of the store.
	//+optional
	Capacity *StoreCapacity `json:"capacity,omitempty"`

	// Priority of the store. The higher the priority, the first to be selected.
	// If this value is 0, this store will not be selected for allocating new database.
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:validation:Maximum=100
	//+kubebuilder:default=10
	//+optional
	Priority int32 `json:"priority,omitempty"`
}

// StoreStatus defines the observed state of Store
type StoreStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// The observed capacity of the store.
	//+optional
	Capacity *StoreCapacity `json:"capacity,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Store is the Schema for the stores API
type Store struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   StoreSpec   `json:"spec,omitempty"`
	Status StoreStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// StoreList contains a list of Store
type StoreList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Store `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Store{}, &StoreList{})
}
