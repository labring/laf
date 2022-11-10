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

// StoreCapacity is the capacity data of a store.
type StoreCapacity struct {

	// The user count of a store.
	//+optional
	UserCount int64 `json:"userCount,omitempty"`

	// The storage space. The unit is MB.
	// The default value is 0 which means unlimited.
	//+optional
	Storage resource.Quantity `json:"storage,omitempty"`

	// The number of objects. The default value is 0 which means unlimited.
	//+optional
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:default=0
	ObjectCount int64 `json:"objectCount,omitempty"`

	// The number of buckets. The default value is 0 which means unlimited.
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:default=0
	//+optional
	BucketCount int64 `json:"bucketCount,omitempty"`
}

// StoreSpec defines the desired state of Store
type StoreSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// The region name identifies the location of the store. This is a required field and default value is "default"
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:MinLength=2
	//+kubebuilder:validation:MaxLength=64
	//+kubebuilder:default=default
	//+kubebuilder:validation:Pattern=[a-z0-9-]+
	//+kubebuilder:printcolumn:name="Region",type="string",JSONPath=".spec.region"
	Region string `json:"region,omitempty"`

	// Provider identifies the store provider. This is readonly, cannot be modified after creation.
	// This value could be the following:
	// - "minio" for a minio cluster, **`laf` would only implement minio controller by default.**
	// - "aws-s3" for aws s3 service
	// - "qiniu" for qiniu service
	// - "google-cloud-storage" for google cloud storage
	// - "azure-blob-storage" for azure blob storage
	// - "aliyun-oss" for aliyun oss
	// - ... (more could be added)
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:MinLength=2
	//+kubebuilder:validation:MaxLength=64
	//+kubebuilder:validation:Pattern=[a-zA-Z0-9-]+
	//+kubebuilder:printcolumn:name="Provider",type="string",JSONPath=".spec.provider"
	Provider string `json:"provider,omitempty"`

	// Endpoint is the store service endpoint.
	// This is url string, like "http://minio-service:9000"
	//+kubebuilder:validation:Required
	Endpoint string `json:"endpoint"`

	// UseSSL indicates whether to use ssl to connect to the store service.
	//+kubebuilder:validation:Required
	//+kubebuilder:default=false
	UseSSL bool `json:"useSSL,omitempty"`

	// AccessKey is the access key which have admin rights of the store service.
	//+kubebuilder:validation:Required
	AccessKey string `json:"accessKey,omitempty"`

	// SecretKey is the secret key which have admin rights of the store service.
	//+kubebuilder:validation:Required
	SecretKey string `json:"secretKey,omitempty"`

	// Capacity is the maximum capacity of the store.
	//+optional
	Capacity StoreCapacity `json:"capacity,omitempty"`

	// Priority is used to guide the allocation of resources.
	// The higher the priority, the first to allocate resources in.
	// If this value is 0, this store will not be selected for allocating new user.
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:validation:Maximum=100
	//+kubebuilder:default=10
	//+optional
	Priority int `json:"priority,omitempty"`
}

// StoreStatus defines the observed state of Store
type StoreStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// The observed capacity of Store.
	//+optional
	Capacity StoreCapacity `json:"capacity,omitempty"`

	// Conditions
	// - Type: Ready
	Conditions []metav1.Condition `json:"conditions,omitempty"`
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
