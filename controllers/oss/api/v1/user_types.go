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

// UserSpec defines the desired state of User
type UserSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// AppId is the unique identifier for the app, usually used as the username of this User.
	//+kubebuilder:validation:MinLength=3
	//+kubebuilder:validation:MaxLength=32
	//+kubebuilder:validation:Required
	AppId string `json:"appid"`

	// Region of oss store.
	//+kubebuilder:validation:Required
	Region string `json:"region"`

	// Password is the secret name of the user, which is used to authenticate the user.
	//+kubebuilder:validation:MinLength=3
	//+kubebuilder:validation:MaxLength=32
	//+kubebuilder:validation:Required
	Password string `json:"password"`

	// Provider name of a oss store. It's read-only after creation.
	// The controller will create the corresponding storage resources based on this provider.
	//+kubebuilder:validation:Required
	Provider string `json:"provider"`

	// Capacity that user desired.
	Capacity UserCapacity `json:"capacity,omitempty"`
}

// UserStatus defines the observed state of User
type UserStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// StoreName of the oss store. It's read-only after creation.
	// The controller has created the corresponding storage resources based on this store.
	//+kubebuilder:validation:Required
	StoreName string `json:"storeName,omitempty"`

	//+kubebuilder:validation:Required
	StoreNamespace string `json:"storeNamespace,omitempty"`

	// AccessKey is the access key of the user
	AccessKey string `json:"accessKey,omitempty"`

	// SecretKey is the secret key of the user
	SecretKey string `json:"secretKey,omitempty"`

	// Endpoint is the store service endpoint.
	//+kubebuilder:validation:Required
	Endpoint string `json:"endpoint,omitempty"`

	// Region of oss store.
	//+kubebuilder:validation:Required
	Region string `json:"region"`

	// The user's capacity observed by the controller.
	Capacity UserCapacity `json:"capacity,omitempty"`

	// Conditions
	// - Type: Ready
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

// UserCapacity is used to obtain the user's used capacity.
type UserCapacity struct {
	// The user's storage space.
	// The default value is 0 which means unlimited.
	//+optional
	Storage resource.Quantity `json:"storage,omitempty"`

	// The user's number of objects.
	//+optional
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:default=0
	ObjectCount int64 `json:"objectCount,omitempty"`

	// The user's number of buckets.
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:default=0
	//+optional
	BucketCount int64 `json:"bucketCount,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// User is the Schema for the users API
type User struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   UserSpec   `json:"spec,omitempty"`
	Status UserStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// UserList contains a list of User
type UserList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []User `json:"items"`
}

func init() {
	SchemeBuilder.Register(&User{}, &UserList{})
}
