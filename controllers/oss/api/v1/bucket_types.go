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

// BucketPolicy mode
type BucketPolicy string

const (
	BucketPolicyReadOnly  BucketPolicy = "readonly"
	BucketPolicyReadWrite BucketPolicy = "public"
	BucketPolicyPrivate   BucketPolicy = "private"
)

// BucketSpec defines the desired state of Bucket
type BucketSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Name of bucket in oss. It's read-only after creation.
	// This will be used as the bucket name in storage store.
	// The length is between 3-63 and can only include letters, numbers and short horizontal lines (-).
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:MinLength=3
	//+kubebuilder:validation:MaxLength=64
	//+kubebuilder:validation:Pattern=^[a-z0-9]([-a-z0-9]*[a-z0-9])?$
	Name string `json:"name"`

	// Policy of bucket in oss. required.
	//+kubebuilder:validation:Required
	Policy BucketPolicy `json:"policy"`

	// Storage space of this bucket, in MB. It defaults to 0, which means no limit.
	//+kubebuilder:validation:Required
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:default=0
	Storage int64 `json:"storage"`

	// The name of oss user.
	//+kubebuilder:validation:Required
	User string `json:"user"`
}

// BucketStatus defines the observed state of Bucket
type BucketStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Capacity of this bucket.
	Capacity BucketCapacity `json:"capacity,omitempty"`
}

type BucketCapacity struct {
	// The user's storage space. The unit is MB.
	// The default value is 0 which means unlimited.
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:default=0
	//+optional
	Storage int64 `json:"storage,omitempty"`

	// The user's number of objects.
	//+optional
	//+kubebuilder:validation:Minimum=0
	//+kubebuilder:default=0
	ObjectCount int64 `json:"objectCount,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Bucket is the Schema for the buckets API
type Bucket struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   BucketSpec   `json:"spec,omitempty"`
	Status BucketStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// BucketList contains a list of Bucket
type BucketList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Bucket `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Bucket{}, &BucketList{})
}
