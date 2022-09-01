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
	"k8s.io/apimachinery/pkg/api/resource"
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

	// Capacity desired.
	//+kubebuilder:validation:Required
	Capacity DatabaseCapacity `json:"capacity"`

	// Username of the database.
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:MinLength=6
	//+kubebuilder:validation:MaxLength=16
	Username string `json:"username"`

	// Password of the database.
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:MinLength=16
	//+kubebuilder:validation:MaxLength=32
	Password string `json:"password"`
}

// DatabaseStatus defines the observed state of Database
type DatabaseStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Store name of this database.
	// The controller has created the corresponding storage resources based on this store.
	//+kubebuilder:validation:Required
	StoreName string `json:"storeName,omitempty"`

	//+kubebuilder:validation:Required
	StoreNamespace string `json:"storeNamespace,omitempty"`

	// ConnectionURI of the database.
	ConnectionURI string `json:"connectionURI"`

	// Capacity observed by the controller
	Capacity DatabaseCapacity `json:"capacity,omitempty"`
}

type DatabaseCapacity struct {
	// The storage space of database.
	//+optional
	Storage resource.Quantity `json:"storage,omitempty"`
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
