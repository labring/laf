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
	"k8s.io/apimachinery/pkg/runtime"
	v1 "laf/controllers/database/api/v1"
	"laf/controllers/database/dbm"
	"laf/pkg/util"
	"net/url"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"
	"time"
)

// DatabaseReconciler reconciles a Database object
type DatabaseReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=database.laf.dev,resources=databases,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=database.laf.dev,resources=databases/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=database.laf.dev,resources=databases/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Database object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.1/pkg/reconcile
func (r *DatabaseReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	_log.Info("reconciling database")

	// get the database
	var database v1.Database
	if err := r.Get(ctx, req.NamespacedName, &database); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// reconcile deletion
	if !database.ObjectMeta.DeletionTimestamp.IsZero() {
		return r.delete(ctx, &database)
	}

	return r.apply(ctx, &database)
}

// apply the database
func (r *DatabaseReconciler) apply(ctx context.Context, database *v1.Database) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// add the finalizer
	if database.ObjectMeta.DeletionTimestamp.IsZero() {
		if !util.ContainsString(database.ObjectMeta.Finalizers, "database.laf.dev") {
			database.ObjectMeta.Finalizers = append(database.ObjectMeta.Finalizers, "database.laf.dev")
			if err := r.Update(ctx, database); err != nil {
				return ctrl.Result{}, err
			}
			_log.Info("added the finalizer")
		}
	}

	// reconcile the store
	if database.Status.StoreName == "" {
		// select a store
		if err := r.selectStore(ctx, database); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("selected a store for database")
	}

	// reconcile the connection uri
	if database.Status.ConnectionURI == "" {
		if err := r.createDatabase(ctx, database); err != nil {
			return ctrl.Result{Requeue: true, RequeueAfter: time.Second * 10}, err
		}
		_log.Info("created database successfully")
	}

	// TODO: reconcile the storage capacity
	if database.Status.Capacity.Storage.Cmp(database.Spec.Capacity.Storage) < 0 {
		// TODO: update the storage capacity
	} else {
		// TODO: update the storage capacity
	}

	return ctrl.Result{}, nil
}

// delete the database
func (r *DatabaseReconciler) delete(ctx context.Context, database *v1.Database) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// get the store
	store, err := r.getDatabaseStore(ctx, database.Status.StoreNamespace, database.Status.StoreName)
	if err != nil {
		return ctrl.Result{}, err
	}

	// new database manager
	mgm, err := dbm.NewMongoManager(ctx, store.Spec.ConnectionURI)
	if err != nil {
		return ctrl.Result{}, err
	}
	defer mgm.Disconnect()

	// delete the database
	err = mgm.RemoveUser(database.Name, database.Spec.Username)
	if err != nil {
		return ctrl.Result{}, err
	}

	_log.Info("database user deleted", "name", database.Name)

	// remove the finalizer
	database.ObjectMeta.Finalizers = util.RemoveString(database.ObjectMeta.Finalizers, "database.laf.dev")
	if err := r.Update(ctx, database); err != nil {
		return ctrl.Result{}, err
	}

	_log.Info("removed the finalizer")
	return ctrl.Result{}, nil
}

// createDatabase create database
func (r *DatabaseReconciler) createDatabase(ctx context.Context, database *v1.Database) error {
	_log := log.FromContext(ctx)

	// get the store
	store, err := r.getDatabaseStore(ctx, database.Status.StoreNamespace, database.Status.StoreName)
	if err != nil {
		return err
	}

	// new database manager
	mgm, err := dbm.NewMongoManager(ctx, store.Spec.ConnectionURI)
	if err != nil {
		return err
	}
	defer mgm.Disconnect()

	// create the database
	err = mgm.CreateDatabase(database.Name, database.Spec.Username, database.Spec.Password)
	if err != nil {
		return err
	}

	_log.Info("database created", "name", database.Name)

	// assemble the connection uri
	u, err := url.Parse(store.Spec.ConnectionURI)
	u.User = url.UserPassword(database.Spec.Username, database.Spec.Password)
	q := u.Query()
	q.Set("authSource", database.Name)
	u.RawQuery = q.Encode()

	// update the database status
	database.Status.ConnectionURI = u.String()
	if err := r.Status().Update(ctx, database); err != nil {
		return err
	}

	return nil
}

// selectStore select the store which match the database
func (r *DatabaseReconciler) selectStore(ctx context.Context, database *v1.Database) error {
	// get the store list
	var storeList v1.StoreList
	if err := r.List(ctx, &storeList); err != nil {
		return err
	}

	// select the store:
	// - match the provider
	// - have enough capacity
	// - have the higher priority
	var store v1.Store
	for _, s := range storeList.Items {
		// skip if the provider is not match
		if s.Spec.Provider != database.Spec.Provider {
			continue
		}

		// skip if the user capacity is not enough
		if s.Status.Capacity != nil && s.Status.Capacity.UserCount >= s.Spec.Capacity.UserCount {
			continue
		}

		// skip if the storage capacity is not enough
		if s.Status.Capacity != nil && s.Status.Capacity.Storage.Cmp(s.Spec.Capacity.Storage) >= 0 {
			continue
		}

		// skip if the priority is lower
		if s.Spec.Priority < store.Spec.Priority {
			continue
		}

		// select the store
		store = s
	}

	// return error if no store found
	if store.Name == "" {
		return errors.New("no available store found")
	}

	// update the database status
	database.Status.StoreName = store.Name
	database.Status.StoreNamespace = store.Namespace
	if err := r.Status().Update(ctx, database); err != nil {
		return err
	}
	return nil
}

// getDatabaseStore get the database store
func (r *DatabaseReconciler) getDatabaseStore(ctx context.Context, storeNamespace string, storeName string) (*v1.Store, error) {
	// get the store
	var store v1.Store
	if err := r.Get(ctx, client.ObjectKey{Namespace: storeNamespace, Name: storeName}, &store); err != nil {
		return nil, err
	}

	return &store, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *DatabaseReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&v1.Database{}).
		Complete(r)
}
