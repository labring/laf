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
	applicationv1 "github.com/labring/laf/controllers/application/api/v1"
	gonanoid "github.com/matoous/go-nanoid/v2"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"laf/pkg/util"
	"os"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"
	"strconv"
)

const creationFormFinalizer = "creationform.finalizers.laf.dev"

// CreationFormReconciler reconciles a CreationForm object
type CreationFormReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=application.laf.dev,resources=creationforms,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=application.laf.dev,resources=creationforms/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=application.laf.dev,resources=creationforms/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the CreationForm object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.2/pkg/reconcile
func (r *CreationFormReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)

	// get the form
	form := &applicationv1.CreationForm{}
	if err := r.Get(ctx, req.NamespacedName, form); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// reconcile deletion
	if !form.ObjectMeta.DeletionTimestamp.IsZero() {
		return r.delete(ctx, form)
	}

	return r.apply(ctx, form)
}

// apply the form
func (r *CreationFormReconciler) apply(ctx context.Context, form *applicationv1.CreationForm) (ctrl.Result, error) {
	log := log.FromContext(ctx)

	// add finalizer if not present
	if !util.ContainsString(form.ObjectMeta.Finalizers, creationFormFinalizer) {
		form.ObjectMeta.Finalizers = append(form.ObjectMeta.Finalizers, creationFormFinalizer)
		if err := r.Update(ctx, form); err != nil {
			return ctrl.Result{}, err
		}

		log.Info("Added finalizer to form")
	}

	// TODO: validate the form spec: bundle, runtime

	// reconcile the namespace
	if form.Status.Namespace == "" {
		appid, err := GenerateAppId()
		if err != nil {
			return ctrl.Result{}, err
		}

		// create the namespace
		var namespace v1.Namespace
		namespace.Name = GetAppNamespacePrefix() + appid
		namespace.Labels = map[string]string{
			"laf.dev/appid":          appid,
			"laf.dev/namespace.type": "app",
		}

		if err := r.Create(ctx, &namespace); err != nil {
			return ctrl.Result{}, err
		}

		log.Info("Created namespace for app")

		form.Status.AppId = appid
		form.Status.Namespace = namespace.Name
		form.Status.Created = false
		if err := r.Status().Update(ctx, form); err != nil {
			return ctrl.Result{}, err
		}

		log.Info("Updated form status: fill the namespace")
		return ctrl.Result{}, nil
	}

	// reconcile the created status
	if !form.Status.Created {
		// create the app
		var app applicationv1.Application
		app.Namespace = form.Status.Namespace
		app.Name = "app"
		app.Labels = map[string]string{
			"laf.dev/appid": form.Status.AppId,
		}
		app.Annotations = map[string]string{
			"laf.dev/name": form.Spec.DisplayName,
		}
		app.Spec.State = applicationv1.ApplicationStateRunning
		app.Spec.BundleName = form.Spec.BundleName
		app.Spec.RuntimeName = form.Spec.RuntimeName

		if err := r.Create(ctx, &app); err != nil {
			return ctrl.Result{}, err
		}

		log.Info("Created app")

		form.Status.Created = true
		if err := r.Status().Update(ctx, form); err != nil {
			return ctrl.Result{}, err
		}

		log.Info("Updated form status")
	} else {
		// delete the form
		if err := r.Delete(ctx, form); err != nil {
			return ctrl.Result{}, err
		}

		log.Info("Deleted form")
	}

	return ctrl.Result{}, nil
}

// delete the form
func (r *CreationFormReconciler) delete(ctx context.Context, form *applicationv1.CreationForm) (ctrl.Result, error) {
	log := log.FromContext(ctx)

	// remove finalizer
	form.ObjectMeta.Finalizers = util.RemoveString(form.ObjectMeta.Finalizers, creationFormFinalizer)
	if err := r.Update(ctx, form); err != nil {
		return ctrl.Result{}, err
	}

	log.Info("Removed finalizer from form")
	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *CreationFormReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&applicationv1.CreationForm{}).
		Complete(r)
}

// GetAppNamespacePrefix returns the app namespace prefix
func GetAppNamespacePrefix() string {
	prefix := ""
	if prefixStr := os.Getenv("APP_NAMESPACE_PREFIX"); prefixStr != "" {
		prefix = prefixStr
	}
	return prefix
}

// GenerateAppId generates app id
func GenerateAppId() (string, error) {
	const alphabet = "23456789abcdefghijklmnopqrstuvwxyz"
	size := 6

	// get size from env
	if sizeStr := os.Getenv("APPID_LENGTH"); sizeStr != "" {
		int64, err := strconv.ParseInt(sizeStr, 10, 64)
		if err == nil {
			size = int(int64)
		}
	}

	appid, err := gonanoid.Generate(alphabet, size)
	return appid, err
}
