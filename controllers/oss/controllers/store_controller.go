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
	"github.com/labring/laf/controllers/oss/driver"
	"laf/pkg/util"
	"time"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	ossv1 "github.com/labring/laf/controllers/oss/api/v1"
)

const storeFinalizer = "store.oss.laf.dev"

// StoreReconciler reconciles a Store object
type StoreReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=oss.laf.dev,resources=stores,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=oss.laf.dev,resources=stores/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=oss.laf.dev,resources=stores/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// the Store object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.2/pkg/reconcile
func (r *StoreReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)

	// get the store
	var store ossv1.Store
	if err := r.Get(ctx, req.NamespacedName, &store); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// reconcile the deletion
	if !store.DeletionTimestamp.IsZero() {
		return r.delete(ctx, &store)
	}

	return r.apply(ctx, &store)
}

// delete deletes the store.
// TODO: implement the deletion of the store.
func (r *StoreReconciler) delete(ctx context.Context, store *ossv1.Store) (ctrl.Result, error) {
	// TODO: reject deletion
	return ctrl.Result{}, nil
}

// apply the store.
func (r *StoreReconciler) apply(ctx context.Context, store *ossv1.Store) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// add finalizer
	if !util.ContainsString(store.GetFinalizers(), storeFinalizer) {
		store.SetFinalizers(append(store.GetFinalizers(), storeFinalizer))
		if err := r.Update(ctx, store); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("added finalizer", "finalizer", storeFinalizer)
	}

	// reconcile the store state
	if store.Status.State == "" {
		err := r.initStore(ctx, store)
		if err != nil {
			return ctrl.Result{Requeue: true, RequeueAfter: time.Minute}, err
		}
		_log.Info("initialized store", "store", store.Name)
	}

	// sync capacity status
	if store.Status.State == ossv1.StoreStateEnabled {
		err := r.syncCapacityStatus(ctx, store)
		if err != nil {
			return ctrl.Result{Requeue: true, RequeueAfter: time.Minute}, err
		}
		_log.Info("synced capacity status", "store", store.Name)
	}

	return ctrl.Result{Requeue: true, RequeueAfter: time.Minute * 5}, nil
}

// initStore initializes the store.
func (r *StoreReconciler) initStore(ctx context.Context, store *ossv1.Store) error {
	// create minio admin client
	mca, err := driver.NewMinioClientAdmin(ctx, store.Spec.Endpoint, store.Spec.AccessKey, store.Spec.SecretKey, false)
	if err != nil {
		return err
	}

	// create initial policy
	if err := mca.CreateInitialPolicy(); err != nil {
		return err
	}

	// create initial group
	if err := mca.CreateInitialGroup(); err != nil {
		return err
	}

	// update store state to enabled
	store.Status.State = ossv1.StoreStateEnabled
	if err := r.Status().Update(ctx, store); err != nil {
		return err
	}

	return nil
}

// syncCapacityStatus syncs the capacity status of the store.
func (r *StoreReconciler) syncCapacityStatus(ctx context.Context, store *ossv1.Store) error {
	// create minio admin client
	mca, err := driver.NewMinioClientAdmin(ctx, store.Spec.Endpoint, store.Spec.AccessKey, store.Spec.SecretKey, false)
	if err != nil {
		return err
	}

	// get capacity
	info, err := mca.GetServerInfo()
	if err != nil {
		return err
	}

	// TODO: update the user count
	// update capacity status
	store.Status.Capacity.Storage.Set(int64(info.Usage.Size))
	store.Status.Capacity.BucketCount = int64(info.Buckets.Count)
	store.Status.Capacity.ObjectCount = int64(info.Objects.Count)
	if err := r.Status().Update(ctx, store); err != nil {
		return err
	}

	return nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *StoreReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&ossv1.Store{}).
		Complete(r)
}
