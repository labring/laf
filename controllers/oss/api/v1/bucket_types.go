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

// BucketPolicy mode
type BucketPolicy string

const (
	BucketPolicyPrivate  BucketPolicy = "private"
	BucketPolicyReadOnly BucketPolicy = "readonly"
	BucketPolicyPublic   BucketPolicy = "readwrite"
)

// BucketSpec defines the desired state of Bucket
type BucketSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Policy of bucket in oss, defaults to 'private'.
	//+kubebuilder:validation:Enum=private;readonly;readwrite
	//+kubebuilder:validation:Default=private
	//+optional
	Policy BucketPolicy `json:"policy"`

	// Storage space of this bucket.
	//+kubebuilder:validation:Required
	Storage resource.Quantity `json:"storage"`
}

// BucketStatus defines the observed state of Bucket
type BucketStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Username of bucket in oss.
	User string `json:"user"`

	// Policy of bucket in oss.
	Policy BucketPolicy `json:"policy"`

	// Versioning of bucket in oss.
	Versioning bool `json:"versioning"`

	// Capacity of this bucket.
	Capacity BucketCapacity `json:"capacity"`

	// Conditions
	// - Type: Ready
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

type BucketCapacity struct {
	// Storage space of this bucket.
	MaxStorage resource.Quantity `json:"maxStorage,omitempty"`

	// The used storage space.
	UsedStorage resource.Quantity `json:"storage,omitempty"`

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
