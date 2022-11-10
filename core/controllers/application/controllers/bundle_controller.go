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

	"github.com/labring/laf/core/pkg/util"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	applicationv1 "github.com/labring/laf/core/controllers/application/api/v1"
)

const finalizerName = "bundle.application.laf.dev"

// BundleReconciler reconciles a Bundle object
type BundleReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=application.laf.dev,resources=bundles,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=application.laf.dev,resources=bundles/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=application.laf.dev,resources=bundles/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Bundle object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.2/pkg/reconcile
func (r *BundleReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)

	// get the bundle
	bundle := &applicationv1.Bundle{}
	err := r.Get(ctx, req.NamespacedName, bundle)
	if err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// reconcile deletions
	if !bundle.ObjectMeta.DeletionTimestamp.IsZero() {
		return r.delete(ctx, bundle)
	}

	return r.apply(ctx, bundle)
}

// apply the specification
func (r *BundleReconciler) apply(ctx context.Context, bundle *applicationv1.Bundle) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// add finalizer
	if !util.ContainsString(bundle.ObjectMeta.Finalizers, finalizerName) {
		bundle.ObjectMeta.Finalizers = append(bundle.ObjectMeta.Finalizers, finalizerName)
		err := r.Update(ctx, bundle)
		if err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("finalizer added for bundle", "bundle", bundle.Name)
	}

	return ctrl.Result{}, nil
}

// delete the specification
func (r *BundleReconciler) delete(ctx context.Context, bundle *applicationv1.Bundle) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// TODO: reject it if there are any applications using it

	// remove finalizer
	bundle.ObjectMeta.Finalizers = util.RemoveString(bundle.ObjectMeta.Finalizers, finalizerName)
	err := r.Update(ctx, bundle)
	if err != nil {
		return ctrl.Result{}, err
	}
	_log.Info("finalizer removed for bundle", "bundle", bundle.Name)
	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *BundleReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&applicationv1.Bundle{}).
		Complete(r)
}
