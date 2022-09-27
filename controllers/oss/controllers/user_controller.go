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

package controllers

import (
	"context"
	"errors"
	"github.com/labring/laf/controllers/oss/driver"
	"github.com/labring/laf/pkg/util"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/log"
	"time"

	ossv1 "github.com/labring/laf/controllers/oss/api/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

const finalizerName = "user.laf.dev"

// UserReconciler reconciles a User object
type UserReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=oss.laf.dev,resources=users,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=oss.laf.dev,resources=users/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=oss.laf.dev,resources=users/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the User object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.2/pkg/reconcile
func (r *UserReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {

	// get the user object
	var user ossv1.User
	if err := r.Get(ctx, req.NamespacedName, &user); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// reconcile deletions
	if !user.DeletionTimestamp.IsZero() {
		return r.delete(ctx, &user)
	}

	return r.apply(ctx, &user)
}

// apply the user object.
func (r *UserReconciler) apply(ctx context.Context, user *ossv1.User) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// add finalizer if not present
	if !util.ContainsString(user.GetFinalizers(), finalizerName) {
		user.SetFinalizers(append(user.GetFinalizers(), finalizerName))
		if err := r.Update(ctx, user); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("added finalizer", "finalizer", finalizerName)
		return ctrl.Result{}, nil
	}

	// reconcile the store
	if user.Status.StoreName == "" {
		if err := r.selectStore(ctx, user); err != nil {
			return ctrl.Result{Requeue: true, RequeueAfter: time.Second * 10}, err
		}
		_log.Info("selected store", "storeName", user.Status.StoreName)
		return ctrl.Result{}, nil
	} else if user.Labels["laf.dev/oss.store.name"] != user.Status.StoreName {
		// add store labels
		user.Labels["laf.dev/oss.store.name"] = user.Status.StoreName
		user.Labels["laf.dev/oss.store.namespace"] = user.Status.StoreNamespace

		if err := r.Update(ctx, user); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("added store labels", "storeName", user.Status.StoreName)
		return ctrl.Result{}, nil
	}

	// create the AccessKey & SecretKey
	if user.Status.AccessKey == "" || user.Status.SecretKey == "" {
		if err := r.createUser(ctx, user); err != nil {
			return ctrl.Result{Requeue: true, RequeueAfter: time.Second * 10}, err
		}
		_log.Info("reconciled access key", "accessKey", user.Status.AccessKey)
		return ctrl.Result{}, nil
	}

	// TODO: reconcile the capacity
	// query the buckets capacity to update user capacity

	return ctrl.Result{}, nil
}

// delete deletes the user object.
func (r *UserReconciler) delete(ctx context.Context, user *ossv1.User) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// get the store of user
	var store ossv1.Store
	if err := r.Get(ctx, client.ObjectKey{Namespace: user.Namespace, Name: user.Status.StoreName}, &store); err != nil {
		return ctrl.Result{}, err
	}

	// delete the user
	if user.Status.AccessKey != "" && user.Status.SecretKey != "" {
		mca, err := driver.NewMinioClientAdmin(ctx, store.Spec.Endpoint, store.Spec.AccessKey, store.Spec.SecretKey, store.Spec.UseSSL)
		if err != nil {
			return ctrl.Result{}, err
		}
		if err := mca.DeleteUser(user.Status.AccessKey); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("deleted user", "user", user.Status.AccessKey)
	}

	// remove finalizer
	user.SetFinalizers(util.RemoveString(user.GetFinalizers(), finalizerName))
	if err := r.Update(ctx, user); err != nil {
		return ctrl.Result{}, err
	}

	_log.Info("removed finalizer", "finalizer", finalizerName)
	return ctrl.Result{}, nil
}

// createUser creates the user object.
func (r *UserReconciler) createUser(ctx context.Context, user *ossv1.User) error {
	// get the store of user
	var store ossv1.Store
	if err := r.Get(ctx, client.ObjectKey{Namespace: user.Namespace, Name: user.Status.StoreName}, &store); err != nil {
		return err
	}

	// create the user
	mca, err := driver.NewMinioClientAdmin(ctx, store.Spec.Endpoint, store.Spec.AccessKey, store.Spec.SecretKey, store.Spec.UseSSL)
	if err != nil {
		return err
	}

	userName := user.Spec.AppId
	if err := mca.CreateUser(userName, user.Spec.Password); err != nil {
		return err
	}

	// add user to initial group
	if err := mca.AddUserToInitialGroup(userName); err != nil {
		return err
	}

	// update the user status
	user.Status.AccessKey = user.Spec.AppId
	user.Status.SecretKey = user.Spec.Password

	// update user conditions
	condition := metav1.Condition{
		Type:               "Ready",
		Status:             metav1.ConditionTrue,
		Reason:             "UserCreated",
		Message:            "User created successfully",
		LastTransitionTime: metav1.Now(),
	}
	util.SetCondition(&user.Status.Conditions, condition)
	return r.Status().Update(ctx, user)
}

// selectStore  selects the store for the user.
func (r *UserReconciler) selectStore(ctx context.Context, user *ossv1.User) error {
	// get store list
	var stores ossv1.StoreList
	if err := r.List(ctx, &stores); err != nil {
		return err
	}

	// select the store
	// - match the provider
	// - match the state
	var store ossv1.Store
	for _, s := range stores.Items {
		if s.Spec.Provider != user.Spec.Provider {
			continue
		}

		if s.Spec.Region != user.Spec.Region {
			continue
		}

		if !util.ConditionIsTrue(s.Status.Conditions, "Ready") {
			continue
		}

		// skip if the priority is lower
		if s.Spec.Priority < store.Spec.Priority {
			continue
		}

		store = s
	}

	if store.Name == "" {
		return errors.New("no available store found")
	}

	// update the user status
	user.Status.StoreName = store.Name
	user.Status.StoreNamespace = store.Namespace
	user.Status.Region = store.Spec.Region
	user.Status.Endpoint = store.Spec.Endpoint

	// update user conditions
	condition := metav1.Condition{
		Type:               "StoreSelected",
		Status:             metav1.ConditionTrue,
		Reason:             "StoreSelected",
		Message:            "Store selected successfully",
		LastTransitionTime: metav1.Now(),
	}
	util.SetCondition(&user.Status.Conditions, condition)

	if err := r.Status().Update(ctx, user); err != nil {
		return err
	}
	return nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *UserReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&ossv1.User{}).
		Complete(r)
}
