package controllers

import (
	"context"
	gatewayv1 "github.com/labring/laf/core/controllers/gateway/api/v1"
	"github.com/labring/laf/core/pkg/common"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/log"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
	"strconv"
	"time"
)

var secretUpdateTimeAnnotation = "secret.laf.dev/secret-update-time"

type SecretReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

func (r *SecretReconciler) Reconcile(ctx context.Context, request reconcile.Request) (reconcile.Result, error) {
	// if namespace is not laf system, ignore
	if request.Namespace != common.GetSystemNamespace() {
		return ctrl.Result{}, nil
	}
	_log := log.FromContext(ctx)
	err := r.Get(ctx, request.NamespacedName, &corev1.Secret{})
	if err != nil {
		return reconcile.Result{}, err
	}

	var domainList gatewayv1.DomainList
	if err := r.List(ctx, &domainList); err != nil {
		return reconcile.Result{}, err
	}
	for _, item := range domainList.Items {
		if item.Spec.CertConfigRef == request.Name {
			_log.Info("will reconcile domain", "name", item.Name)
			if _, err := controllerutil.CreateOrUpdate(ctx, r.Client, &item, func() error {
				if item.Annotations == nil {
					item.Annotations = make(map[string]string)
				}
				item.Annotations[secretUpdateTimeAnnotation] = strconv.FormatInt(time.Now().Unix(), 10)
				return nil
			}); err != nil {
				return ctrl.Result{}, err
			}
		}
	}

	return ctrl.Result{}, nil
}

func (r *SecretReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&corev1.Secret{}).
		Complete(r)
}
