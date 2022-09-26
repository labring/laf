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
	runtimev1 "github.com/labring/laf/controllers/runtime/api/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// EDIT THIS FILE!  THIS IS SCAFFOLDING FOR YOU TO OWN!
// NOTE: json tags are required.  Any new fields you add must have json tags for the fields to be serialized.

// ApplicationState defines the state of the application
type ApplicationState string

const (
	ApplicationStateInitializing ApplicationState = "Initializing"
	ApplicationStateInitialized  ApplicationState = "Initialized"
	ApplicationStateStarting     ApplicationState = "Starting"
	ApplicationStateRunning      ApplicationState = "Running"
	ApplicationStateStopping     ApplicationState = "Stopping"
	ApplicationStateStopped      ApplicationState = "Stopped"
)

type ApplicationConditionType string

const (
	ApplicationBundleInitialized  ApplicationConditionType = "BundleInitialized"
	ApplicationRuntimeInitialized ApplicationConditionType = "RuntimeInitialized"

	// ApplicationInitialized = Initialized + DatabaseCreated + ObjectStorageCreated + GatewayCreated + InstanceCreated
	ApplicationInitialized          ApplicationConditionType = "Initialized"
	ApplicationDatabaseCreated      ApplicationConditionType = "DatabaseCreated"
	ApplicationObjectStorageCreated ApplicationConditionType = "ObjectStorageCreated"
	ApplicationGatewayCreated       ApplicationConditionType = "GatewayCreated"
	ApplicationInstanceCreated      ApplicationConditionType = "InstanceCreated"

	// ApplicationReady = DatabaseReady + ObjectStorageReady + GatewayReady + InstanceReady
	ApplicationReady              ApplicationConditionType = "Ready"
	ApplicationDatabaseReady      ApplicationConditionType = "DatabaseReady"
	ApplicationObjectStorageReady ApplicationConditionType = "ObjectStorageReady"
	ApplicationGatewayReady       ApplicationConditionType = "GatewayReady"
	ApplicationInstanceReady      ApplicationConditionType = "InstanceReady"

	// ApplicationDeleted = DatabaseDeleted + ObjectStorageDeleted + GatewayDeleted + InstanceDeleted
	ApplicationDeleted              ApplicationConditionType = "Deleted"
	ApplicationDatabaseDeleted      ApplicationConditionType = "DatabaseDeleted"
	ApplicationObjectStorageDeleted ApplicationConditionType = "ObjectStorageDeleted"
	ApplicationGatewayDeleted       ApplicationConditionType = "GatewayDeleted"
	ApplicationInstanceDeleted      ApplicationConditionType = "InstanceDeleted"
)

// ApplicationSpec defines the desired state of Application
type ApplicationSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// AppId
	//+kubebuilder:validation:MinLength=3
	//+kubebuilder:validation:MaxLength=24
	//+kubebuilder:validation:Required
	AppId string `json:"appid"`

	// State of the application
	//+kubebuilder:validation:Enum=Running;Stopped;
	//+kubebuilder:validation:Required
	//+kubebuilder:default:=Running
	State ApplicationState `json:"state,omitempty"`

	// Bundle Name for the application
	//+kubebuilder:validation:Required
	BundleName string `json:"bundleName"`

	// Runtime Name of the application
	//+kubebuilder:validation:Required
	RuntimeName string `json:"runtimeName"`
}

// ApplicationStatus defines the observed state of Application
type ApplicationStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Bundle of the application
	Bundle Bundle `json:"bundle,omitempty"`

	// Runtime of the application
	Runtime runtimev1.Runtime `json:"runtime,omitempty"`

	// State of the application
	Phase ApplicationState `json:"state,omitempty"`

	// Conditions:
	// @see ApplicationConditionType for the list of conditions
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Application is the Schema for the applications API
type Application struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ApplicationSpec   `json:"spec,omitempty"`
	Status ApplicationStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// ApplicationList contains a list of Application
type ApplicationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Application `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Application{}, &ApplicationList{})
}
