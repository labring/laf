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
	gatewayv1 "github.com/labring/laf/core/controllers/gateway/api/v1"
	"github.com/labring/laf/core/controllers/gateway/apisix"
	"github.com/labring/laf/core/pkg/common"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/log"
)

const sslFinalizer = "ssl.gateway.laf.dev"

// DomainReconciler reconciles a Domain object
type DomainReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=gateway.laf.dev,resources=domains,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=gateway.laf.dev,resources=domains/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=gateway.laf.dev,resources=domains/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Domain object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.2/pkg/reconcile
func (r *DomainReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)
	var domain gatewayv1.Domain
	if err := r.Get(ctx, req.NamespacedName, &domain); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}
	if !domain.DeletionTimestamp.IsZero() {
		return r.delete(ctx, &domain)
	}

	return r.apply(ctx, &domain)
}

func (r *DomainReconciler) apply(ctx context.Context, domain *gatewayv1.Domain) (ctrl.Result, error) {
	_log := log.FromContext(ctx)
	_log.Info("apply domain: " + domain.Name)

	if domain.Spec.CertConfigRef == "" {
		return ctrl.Result{}, nil
	}

	var secret corev1.Secret
	if err := r.Get(ctx, client.ObjectKey{Namespace: common.GetSystemNamespace(), Name: domain.Spec.CertConfigRef}, &secret); err != nil {
		return ctrl.Result{}, err
	}
	if secret.Data["tls.crt"] == nil || secret.Data["tls.key"] == nil {
		return ctrl.Result{}, errors.New("secret tls.crt or tls.key is nil")
	}
	data := map[string]interface{}{
		"cert": string(secret.Data["tls.crt"]),
		"key":  string(secret.Data["tls.key"]),
		"snis": []string{"*." + domain.Spec.Domain},
	}
	cluster := apisix.NewCluster(domain.Spec.Cluster.Url, domain.Spec.Cluster.Key)
	sslClient := apisix.NewSSLClient(cluster)
	err := sslClient.Put(domain.Name, data)
	if err != nil {
		return ctrl.Result{}, err
	}

	// add finalizer if not present
	if controllerutil.AddFinalizer(domain, routeFinalizer) {
		if err := r.Update(ctx, domain); err != nil {
			return ctrl.Result{}, err
		}
	}

	return ctrl.Result{}, nil
}

func (r *DomainReconciler) delete(ctx context.Context, domain *gatewayv1.Domain) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	cluster := apisix.NewCluster(domain.Spec.Cluster.Url, domain.Spec.Cluster.Key)
	sslClient := apisix.NewSSLClient(cluster)
	sslClient.Delete(domain.Name)

	// remove the finalizer
	if controllerutil.RemoveFinalizer(domain, routeFinalizer) {
		if err := r.Update(ctx, domain); err != nil {
			return ctrl.Result{}, err
		}
	}

	_log.Info("ssl deleted: " + domain.Name)
	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *DomainReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&gatewayv1.Domain{}).
		Complete(r)
}
