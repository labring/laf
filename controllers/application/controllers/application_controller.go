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
	runtimev1 "github.com/labring/laf/controllers/runtime/api/v1"
	"github.com/labring/laf/pkg/common"
	"github.com/labring/laf/pkg/util"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	applicationv1 "github.com/labring/laf/controllers/application/api/v1"
)

const ApplicationFinalizer = "application.finalizers.laf.dev"

// ApplicationReconciler reconciles a Application object
type ApplicationReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=application.laf.dev,resources=applications,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=application.laf.dev,resources=applications/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=application.laf.dev,resources=applications/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Application object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.1/pkg/reconcile
func (r *ApplicationReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)

	// get the application
	application := &applicationv1.Application{}
	err := r.Get(ctx, req.NamespacedName, application)
	if err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// deal with the deletion
	if !application.ObjectMeta.DeletionTimestamp.IsZero() {
		return r.delete(ctx, application)
	}

	return r.apply(ctx, application)
}

// apply is called when the application is created or updated
func (r *ApplicationReconciler) apply(ctx context.Context, application *applicationv1.Application) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// check if the finalizer is present
	if !util.ContainsString(application.ObjectMeta.Finalizers, ApplicationFinalizer) {
		application.ObjectMeta.Finalizers = append(application.ObjectMeta.Finalizers, ApplicationFinalizer)
		err := r.Update(ctx, application)
		if err != nil {
			return ctrl.Result{}, err
		}

		_log.Info("finalizer added for application")
		return ctrl.Result{}, nil
	}

	// reconcile runtime
	if application.Status.Runtime.Name != application.Spec.RuntimeName {
		err := r.reconcileRuntime(ctx, application)
		if err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("runtime reconciled")
		return ctrl.Result{}, nil
	}

	// reconcile bundle
	if application.Status.Bundle.Name != application.Spec.BundleName {
		if err := r.reconcileBundle(ctx, application); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("bundle reconciled")
		return ctrl.Result{}, nil
	}

	// reconcile phase of application
	if application.Status.Phase != application.Spec.State {
		if err := r.reconcilePhase(ctx, application); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("phase reconciled")
		return ctrl.Result{}, nil
	}

	return ctrl.Result{}, nil
}

// reconcileRuntime reconciles the runtime of the application
func (r *ApplicationReconciler) reconcileRuntime(ctx context.Context, application *applicationv1.Application) error {
	// get runtime by name
	rt := &runtimev1.Runtime{}
	err := r.Get(ctx, client.ObjectKey{
		Namespace: common.GetSystemNamespace(),
		Name:      application.Spec.RuntimeName,
	}, rt)
	if err != nil {
		return err
	}

	// update the condition
	condition := metav1.Condition{
		Type:               string(applicationv1.ApplicationRuntimeInitialized),
		Status:             metav1.ConditionTrue,
		Reason:             "RuntimeInitialized",
		Message:            "runtime initialized",
		LastTransitionTime: metav1.Now(),
	}
	util.SetCondition(&application.Status.Conditions, condition)

	// update the status
	application.Status.Runtime = *rt
	err = r.Status().Update(ctx, application)
	return err
}

// reconcileBundle reconciles the bundle of the application
func (r *ApplicationReconciler) reconcileBundle(ctx context.Context, application *applicationv1.Application) error {
	// get bundle by name
	bundle := &applicationv1.Bundle{}
	err := r.Get(ctx, client.ObjectKey{
		Namespace: common.GetSystemNamespace(),
		Name:      application.Spec.BundleName,
	}, bundle)
	if err != nil {
		return err
	}

	// update the condition
	condition := metav1.Condition{
		Type:               string(applicationv1.ApplicationBundleInitialized),
		Status:             metav1.ConditionTrue,
		Reason:             "BundleInitialized",
		Message:            "bundle initialized",
		LastTransitionTime: metav1.Now(),
	}
	util.SetCondition(&application.Status.Conditions, condition)

	// update the status
	application.Status.Bundle = *bundle
	err = r.Status().Update(ctx, application)
	return err
}

// delete is called when the application is deleted
func (r *ApplicationReconciler) delete(ctx context.Context, application *applicationv1.Application) (ctrl.Result, error) {

	// TODO: delete the application
	if false {
		return ctrl.Result{}, nil
	}

	// remove the finalizer
	application.ObjectMeta.Finalizers = util.RemoveString(application.ObjectMeta.Finalizers, ApplicationFinalizer)
	err := r.Update(ctx, application)
	if err != nil {
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

// reconcilePhase reconciles the phase of the application
func (r *ApplicationReconciler) reconcilePhase(ctx context.Context, application *applicationv1.Application) error {
	// TODO

	return nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *ApplicationReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&applicationv1.Application{}).
		Complete(r)
}
