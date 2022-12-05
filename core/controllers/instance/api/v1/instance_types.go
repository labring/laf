package v1

import (
	appv1 "github.com/labring/laf/core/controllers/application/api/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// EDIT THIS FILE!  THIS IS SCAFFOLDING FOR YOU TO OWN!
// NOTE: json tags are required.  Any new fields you add must have json tags for the fields to be serialized.

type InstanceState string

const (
	InstanceStateRunning InstanceState = "Running"
	InstanceStateStopped InstanceState = "Stopped"
)

const (
	DeploymentAndServiceCreating string = "DeploymentAndServiceCreating"
	DeploymentAndServiceCreated  string = "DeploymentAndServiceCreated"
	Ready                        string = "Ready"
	DeploymentAndServiceStopping string = "DeploymentAndServiceStopping"
	DeploymentAndServiceStopped  string = "DeploymentAndServiceStopped"
)

type RuntimeImageGroup struct {
	// Main image (e.g. docker.io/lafyun/app-service:latest)
	Main string `json:"main"`

	// Sidecar image
	Sidecar string `json:"sidecar,omitempty"`

	// Init image (e.g. docker.io/lafyun/app-service-init:latest)
	Init string `json:"init,omitempty"`
}

// Runtime defines the desired state of Runtime
type Runtime struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	Name string `json:"name"`

	// Type of the runtime. eg. node:laf, node:tcb, go:laf, python:laf, php:laf,  etc.
	Type string `json:"type"`

	// Images of the runtime
	Image RuntimeImageGroup `json:"image"`

	// Version of the runtime
	Version string `json:"version"`

	// Latest version or not
	Latest bool `json:"latest,omitempty"`
}

type OSSAccess struct {

	// AccessKey is the access key of the user
	AccessKey string `json:"accessKey,omitempty"`

	// SecretKey is the secret key of the user
	SecretKey string `json:"secretKey,omitempty"`

	// Endpoint is the oss server endpoint.
	//+kubebuilder:validation:Required
	Endpoint string `json:"endpoint,omitempty"`

	// InternalEndpoint is the internal endpoint of the oss server
	//+kubebuilder:validation:Required
	InternalEndpoint string `json:"internalEndpoint,omitempty"`

	// Region of oss store.
	//+kubebuilder:validation:Required
	Region string `json:"region"`
}

// InstanceSpec defines the desired state of Instance
type InstanceSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// AppId of the instance
	//+kubebuilder:validation:Required
	AppId string `json:"appid,omitempty"`

	// Bundle of the instance
	//+kubebuilder:validation:Required
	Bundle appv1.Bundle `json:"bundle,omitempty"`

	// Runtime of the instance
	//+kubebuilder:validation:Required
	Runtime Runtime `json:"runtime,omitempty"`

	// Database of the instance
	//+kubebuilder:validation:Required
	DatabaseConnectionUri string `json:"databaseConnectionUri,omitempty"`

	// OssAccess of the instance
	//+kubebuilder:validation:Required
	OssAccess OSSAccess `json:"ossUser,omitempty"`

	// Replica of instance
	//+kubebuilder:default=1
	Replica int32 `json:"replica,omitempty"`

	// State of the instance
	//+kubebuilder:validation:Enum=Running;Stopped
	//+kubebuilder:validation:Required
	State InstanceState `json:"state,omitempty"`
}

// InstanceStatus defines the observed state of Instance
type InstanceStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	DeploymentName string `json:"DeploymentName,omitempty"`

	ServiceName string `json:"serviceName,omitempty"`

	Status InstanceState `json:"status,omitempty"`

	Replicas int32 `json:"replicas,omitempty" protobuf:"varint,2,opt,name=replicas"`

	// Total number of non-terminated pods targeted by this deployment that have the desired template spec.
	// +optional
	UpdatedReplicas int32 `json:"updatedReplicas,omitempty" protobuf:"varint,3,opt,name=updatedReplicas"`

	// readyReplicas is the number of pods targeted by this Deployment with a Ready Condition.
	// +optional
	ReadyReplicas int32 `json:"readyReplicas,omitempty" protobuf:"varint,7,opt,name=readyReplicas"`

	// Total number of available pods (ready for at least minReadySeconds) targeted by this deployment.
	// +optional
	AvailableReplicas int32 `json:"availableReplicas,omitempty" protobuf:"varint,4,opt,name=availableReplicas"`

	// Total number of unavailable pods targeted by this deployment. This is the total number of
	// pods that are still required for the deployment to have 100% available capacity. They may
	// either be pods that are running but not yet available or pods that still have not been created.
	// +optional
	UnavailableReplicas int32 `json:"unavailableReplicas,omitempty" protobuf:"varint,5,opt,name=unavailableReplicas"`

	// Conditions of the instance
	// @see string for the list of conditions
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status
//+kubebuilder:resource:shortName=instance
//+kubebuilder:printcolumn:name="REGION",type=string,JSONPath=`.spec.region`
//+kubebuilder:printcolumn:name="STATUS",type=string,JSONPath=`.status.status`
//+kubebuilder:printcolumn:name="READY",type=string,JSONPath=`.status.readyReplicas`
//+kubebuilder:printcolumn:name="UP-TO-DATE",type=string,JSONPath=`.status.updatedReplicas`
//+kubebuilder:printcolumn:name="AVAILABLE",type=string,JSONPath=`.status.availableReplicas`
//+kubebuilder:printcolumn:name="UNAVAILABLE",type=string,JSONPath=`.status.unavailableReplicas`

// Instance is the Schema for the instances API
type Instance struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   InstanceSpec   `json:"spec,omitempty"`
	Status InstanceStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// InstanceList contains a list of Instance
type InstanceList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Instance `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Instance{}, &InstanceList{})
}
