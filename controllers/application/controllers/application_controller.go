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
	"fmt"
	appv1 "github.com/labring/laf/controllers/application/api/v1"
	runtimev1 "github.com/labring/laf/controllers/runtime/api/v1"
	"github.com/labring/laf/pkg/common"
	"github.com/labring/laf/pkg/util"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"
	"time"
)

const ApplicationFinalizer = "application.finalizers.laf.dev"

// ApplicationReconciler reconciles application object
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
	application := &appv1.Application{}
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
func (r *ApplicationReconciler) apply(ctx context.Context, app *appv1.Application) (ctrl.Result, error) {
	g := log.FromContext(ctx)

	// check if the finalizer is present
	if !util.ContainsString(app.ObjectMeta.Finalizers, ApplicationFinalizer) {
		app.ObjectMeta.Finalizers = append(app.ObjectMeta.Finalizers, ApplicationFinalizer)
		err := r.Update(ctx, app)
		if err != nil {
			return ctrl.Result{}, err
		}
		g.Info("finalizer added for app")
		return ctrl.Result{}, nil
	}

	// reconcile runtime
	if app.Status.RuntimeName != app.Spec.RuntimeName {
		err := r.reconcileRuntime(ctx, app)
		if err != nil {
			return ctrl.Result{}, err
		}
		g.Info("runtime reconciled")
		return ctrl.Result{}, nil
	}

	// reconcile bundle
	if app.Status.BundleName != app.Spec.BundleName {
		if err := r.reconcileBundle(ctx, app); err != nil {
			return ctrl.Result{}, err
		}
		g.Info("bundle reconciled")
		return ctrl.Result{}, nil
	}

	// TODO sync the ready status of app resources: db, gateway, oss.

	// reconcile phase of app
	if app.Status.Phase != app.Spec.State {
		return r.reconcilePhase(ctx, app)
	}

	return ctrl.Result{}, nil
}

// reconcilePhase reconciles the phase of the application
func (r *ApplicationReconciler) reconcilePhase(ctx context.Context, app *appv1.Application) (ctrl.Result, error) {
	g := log.FromContext(ctx)

	// update phase to initializing
	if app.Status.Phase == "" {
		err := r.updatePhaseTo(ctx, app, appv1.ApplicationStateInitializing)
		return ctrl.Result{}, err
	}

	// When the app is `Initializing`, initialize it.
	if app.Status.Phase == appv1.ApplicationStateInitializing {
		return r.initialize(ctx, app)
	}

	// When the app is initialized, we need to turn it to the stopped phase first
	if app.Status.Phase == appv1.ApplicationStateInitialized {
		err := r.updatePhaseTo(ctx, app, appv1.ApplicationStateStopped)
		return ctrl.Result{}, err
	}

	// When the app is `Stopped`, we need to check if the app desired to be running.
	// - create the instance
	// - set the app status to starting
	if app.Status.Phase == appv1.ApplicationStateStopped &&
		app.Spec.State == appv1.ApplicationStateRunning {
		// TODO create the instance

		// set the app phase to starting
		err := r.updatePhaseTo(ctx, app, appv1.ApplicationStateStarting)
		return ctrl.Result{}, err
	}

	// When the app is `Starting`, we need to wait for the instance to be ready.
	// - sync the instance ready state
	// - sync the app status to `Running` if the instance is ready
	if app.Status.Phase == appv1.ApplicationStateStarting &&
		app.Spec.State == appv1.ApplicationStateRunning {
		// TODO sync the instance ready status

		// set app phase to running if the instance is ready
		condition := metav1.Condition{
			Type:               appv1.Ready,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "InstanceReady",
			Message:            "The instance is ready",
		}

		util.SetCondition(&app.Status.Conditions, condition)
		app.Status.Phase = appv1.ApplicationStateRunning
		err := r.Status().Update(ctx, app)
		if err != nil {
			return ctrl.Result{}, err
		}
		g.Info("app is running (ready)")
		return ctrl.Result{}, nil
	}

	// When the app is desired to be stopped, we need to delete the instance.
	if app.Spec.State == appv1.ApplicationStateStopped {
		// TODO delete the instance if exists

		// set app phase to stopping
		err := r.updatePhaseTo(ctx, app, appv1.ApplicationStateStopping)
		return ctrl.Result{}, err
	}

	// When the app is `Stopping`, we need to wait for the instance to be deleted:
	if app.Status.Phase == appv1.ApplicationStateStopping {
		// TODO sync the instance deleted status

		// set app phase to stopped if the instance is deleted
		err := r.updatePhaseTo(ctx, app, appv1.ApplicationStateStopped)
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

// initialize the app:
// - create the database
// - create the oss user
// - create the gateway
// - sync & wait for the resources to be ready
// - update the app status to initialized
func (r *ApplicationReconciler) initialize(ctx context.Context, app *appv1.Application) (ctrl.Result, error) {
	g := log.FromContext(ctx)

	// create the database
	if util.ConditionIsNotTrue(app.Status.Conditions, appv1.DatabaseCreated) {
		// TODO create database

		// set condition DatabaseCreated to true
		condition := metav1.Condition{
			Type:               appv1.DatabaseCreated,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "DatabaseCreated",
			Message:            "Database created",
		}

		util.SetCondition(&app.Status.Conditions, condition)
		err := r.Status().Update(ctx, app)
		if err != nil {
			return ctrl.Result{}, err
		}
		g.Info("database created")
		return ctrl.Result{}, nil
	}

	// create the oss user
	if util.ConditionIsNotTrue(app.Status.Conditions, appv1.ObjectStorageCreated) {
		// TODO create oss user

		// set condition ObjectStorageCreated to true
		condition := metav1.Condition{
			Type:               appv1.ObjectStorageCreated,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "ObjectStorageCreated",
			Message:            "Object storage created",
		}

		util.SetCondition(&app.Status.Conditions, condition)
		err := r.Status().Update(ctx, app)
		if err != nil {
			return ctrl.Result{}, err
		}
		g.Info("object storage created")
		return ctrl.Result{}, nil
	}

	// create the gateway
	if util.ConditionIsNotTrue(app.Status.Conditions, appv1.GatewayCreated) {
		// TODO create the gateway

		// set condition GatewayCreated to true
		condition := metav1.Condition{
			Type:               appv1.GatewayCreated,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "GatewayCreated",
			Message:            "Gateway created",
		}

		util.SetCondition(&app.Status.Conditions, condition)
		err := r.Status().Update(ctx, app)
		if err != nil {
			return ctrl.Result{}, err
		}
		g.Info("gateway created")
		return ctrl.Result{}, nil
	}

	// sync the database ready condition
	if util.ConditionIsNotTrue(app.Status.Conditions, appv1.DatabaseReady) {
		// TODO get database ready condition

		// set condition DatabaseReady to true if database is ready
		condition := metav1.Condition{
			Type:               appv1.DatabaseReady,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "DatabaseReady",
			Message:            "Database ready",
		}

		util.SetCondition(&app.Status.Conditions, condition)
		err := r.Status().Update(ctx, app)
		if err != nil {
			return ctrl.Result{}, err
		}
		g.Info("database ready")
		return ctrl.Result{}, nil
	}

	// sync the oss user ready condition
	if util.ConditionIsNotTrue(app.Status.Conditions, appv1.ObjectStorageReady) {
		// TODO get oss user ready condition

		// set condition ObjectStorageReady to true if oss user is ready
		condition := metav1.Condition{
			Type:               appv1.ObjectStorageReady,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "ObjectStorageReady",
			Message:            "Object storage ready",
		}

		util.SetCondition(&app.Status.Conditions, condition)
		err := r.Status().Update(ctx, app)
		if err != nil {
			return ctrl.Result{}, err
		}
		g.Info("object storage ready")
		return ctrl.Result{}, nil
	}

	// sync the gateway ready condition
	if util.ConditionIsNotTrue(app.Status.Conditions, appv1.GatewayReady) {
		// TODO get gateway ready condition

		// set condition GatewayReady to true if gateway is ready
		condition := metav1.Condition{
			Type:               appv1.GatewayReady,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "GatewayReady",
			Message:            "Gateway ready",
		}

		util.SetCondition(&app.Status.Conditions, condition)
		err := r.Status().Update(ctx, app)
		if err != nil {
			return ctrl.Result{}, err
		}
		g.Info("gateway ready")
		return ctrl.Result{}, nil
	}

	// set app phase to initialized
	if util.ConditionsAreTrue(app.Status.Conditions, appv1.DatabaseReady, appv1.ObjectStorageReady, appv1.GatewayReady) {
		err := r.updatePhaseTo(ctx, app, appv1.ApplicationStateInitialized)
		return ctrl.Result{}, err
	}

	return ctrl.Result{RequeueAfter: time.Second}, nil
}

// reconcileRuntime reconciles the runtime of the application
func (r *ApplicationReconciler) reconcileRuntime(ctx context.Context, app *appv1.Application) error {
	// get runtime by name
	rt := &runtimev1.Runtime{}
	err := r.Get(ctx, client.ObjectKey{
		Namespace: common.GetSystemNamespace(),
		Name:      app.Spec.RuntimeName,
	}, rt)
	if err != nil {
		return err
	}

	// update the condition
	condition := metav1.Condition{
		Type:               appv1.RuntimeInitialized,
		Status:             metav1.ConditionTrue,
		Reason:             "RuntimeInitialized",
		Message:            "runtime initialized",
		LastTransitionTime: metav1.Now(),
	}
	util.SetCondition(&app.Status.Conditions, condition)

	// update the status
	app.Status.RuntimeName = app.Spec.RuntimeName
	app.Status.RuntimeSpec = rt.Spec
	err = r.Status().Update(ctx, app)
	return err
}

// reconcileBundle reconciles the bundle of the application
func (r *ApplicationReconciler) reconcileBundle(ctx context.Context, app *appv1.Application) error {
	// get bundle by name
	bundle := &appv1.Bundle{}
	err := r.Get(ctx, client.ObjectKey{
		Namespace: common.GetSystemNamespace(),
		Name:      app.Spec.BundleName,
	}, bundle)
	if err != nil {
		return err
	}

	// update the condition
	condition := metav1.Condition{
		Type:               appv1.BundleInitialized,
		Status:             metav1.ConditionTrue,
		Reason:             "BundleInitialized",
		Message:            "bundle initialized",
		LastTransitionTime: metav1.Now(),
	}
	util.SetCondition(&app.Status.Conditions, condition)
	app.Status.BundleName = app.Spec.BundleName
	app.Status.BundleSpec = bundle.Spec
	err = r.Status().Update(ctx, app)
	return err
}

// delete is called when the application is deleted
func (r *ApplicationReconciler) delete(ctx context.Context, app *appv1.Application) (ctrl.Result, error) {

	// TODO: delete the application

	// remove the finalizer
	app.ObjectMeta.Finalizers = util.RemoveString(app.ObjectMeta.Finalizers, ApplicationFinalizer)
	err := r.Update(ctx, app)
	if err != nil {
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

// update app phase
func (r *ApplicationReconciler) updatePhaseTo(ctx context.Context, app *appv1.Application, phase appv1.ApplicationState) error {
	g := log.FromContext(ctx)
	old := app.Status.Phase
	app.Status.Phase = phase
	err := r.Status().Update(ctx, app)
	if err != nil {
		return err
	}
	g.Info(fmt.Sprintf("app phase updated to %s from %s", phase, old))
	return err
}

// SetupWithManager sets up the controller with the Manager.
func (r *ApplicationReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&appv1.Application{}).
		Complete(r)
}
