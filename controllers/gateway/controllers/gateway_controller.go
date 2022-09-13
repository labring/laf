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
	ossv1 "github.com/labring/laf/controllers/oss/api/v1"
	"laf/pkg/util"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	gatewayv1 "github.com/labring/laf/controllers/gateway/api/v1"
)

// GatewayReconciler reconciles a Gateway object
type GatewayReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=gateway.laf.dev,resources=gateways,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=gateway.laf.dev,resources=gateways/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=gateway.laf.dev,resources=gateways/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Gateway object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.1/pkg/reconcile
func (r *GatewayReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)
	// get route
	gateway := &gatewayv1.Gateway{}
	if err := r.Get(ctx, req.NamespacedName, gateway); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}
	if !gateway.DeletionTimestamp.IsZero() {
		return r.delete(ctx, gateway)
	}

	return r.apply(ctx, gateway)
}

func (r *GatewayReconciler) delete(ctx context.Context, gateway *gatewayv1.Gateway) (ctrl.Result, error) {

	// delete app route
	if gateway.Status.AppRoute != nil {
		if _, err := r.deleteApp(ctx, gateway); err != nil {
			return ctrl.Result{}, err
		}
	}

	// delete bucket route
	if gateway.Status.BucketRoutes != nil {
		if _, err := r.deleteBucket(ctx, gateway); err != nil {
			return ctrl.Result{}, err
		}
	}

	return ctrl.Result{}, nil
}

func (r *GatewayReconciler) apply(ctx context.Context, gateway *gatewayv1.Gateway) (ctrl.Result, error) {
	if gateway.Status.AppRoute == nil {
		result, err := r.applyApp(ctx, gateway)
		if err != nil {
			return result, err
		}
	}

	// 添加bucket 路由
	if gateway.Status.BucketRoutes == nil || len(gateway.Status.BucketRoutes) > len(gateway.Status.BucketRoutes) {
		result, err := r.applyBucket(ctx, gateway)
		if err != nil {
			return result, err
		}
	}

	return ctrl.Result{}, nil
}

// applyDomain apply domain
func (r *GatewayReconciler) applyApp(ctx context.Context, gateway *gatewayv1.Gateway) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	finalizerName := "app.gateway.laf.dev"

	// add finalizer
	if !util.ContainsString(gateway.GetFinalizers(), finalizerName) {
		gateway.SetFinalizers(append(gateway.GetFinalizers(), finalizerName))
		if err := r.Update(ctx, gateway); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("added finalizer", "finalizer", finalizerName)
	}

	// TODO select app from application
	region := "default"

	// select app domain
	appDomain, err := r.selectDomain(ctx, gatewayv1.APP, region)
	if err != nil {
		return ctrl.Result{}, err
	}
	if appDomain == nil {
		_log.Info("no app domain found")
	}

	// set gateway status
	gateway.Status.AppRoute = &gatewayv1.GatewayRoute{
		DomainName:      appDomain.Name,
		DomainNamespace: appDomain.Namespace,
		Domain:          gateway.Spec.AppId + "." + appDomain.Spec.Domain,
	}

	// create app route
	appRoute := &gatewayv1.Route{
		ObjectMeta: ctrl.ObjectMeta{
			Name:      "app",
			Namespace: gateway.Spec.AppId,
		},
		Spec: gatewayv1.RouteSpec{
			Domain:          gateway.Status.AppRoute.Domain,
			DomainName:      appDomain.Name,
			DomainNamespace: appDomain.Namespace,
			Backend: gatewayv1.Backend{
				ServiceName: gateway.Spec.AppId,
				ServicePort: 80,
			},
		},
	}
	if err := r.Create(ctx, appRoute); err != nil {
		return ctrl.Result{}, err
	}

	// update gateway status
	if err := r.Status().Update(ctx, gateway); err != nil {
		return ctrl.Result{}, err
	}
	return ctrl.Result{}, nil
}

// deleteApp delete app
func (r *GatewayReconciler) deleteApp(ctx context.Context, gateway *gatewayv1.Gateway) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	finalizerName := "app.gateway.laf.dev"

	// delete app route
	appRoute := &gatewayv1.Route{}
	if err := r.Get(ctx, client.ObjectKey{Name: "app", Namespace: gateway.Spec.AppId}, appRoute); err != nil {
		return ctrl.Result{}, err
	}
	if err := r.Delete(ctx, appRoute); err != nil {
		return ctrl.Result{}, err
	}

	// remove finalizer
	if util.ContainsString(gateway.GetFinalizers(), finalizerName) {
		gateway.SetFinalizers(util.RemoveString(gateway.GetFinalizers(), finalizerName))
		if err := r.Update(ctx, gateway); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("removed finalizer", "finalizer", finalizerName)
	}

	return ctrl.Result{}, nil
}

// applyBucket apply bucket
func (r *GatewayReconciler) applyBucket(ctx context.Context, gateway *gatewayv1.Gateway) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// if gateway status bucketRoutes is nil, init it
	if gateway.Status.BucketRoutes == nil {
		gateway.Status.BucketRoutes = make(map[string]*gatewayv1.GatewayRoute, 0)
	}

	// select bucket domain
	for _, bucketName := range gateway.Spec.Buckets {

		finalizerName := bucketName + ".bucket.gateway.laf.dev"

		// add finalizer
		if !util.ContainsString(gateway.GetFinalizers(), finalizerName) {
			gateway.SetFinalizers(append(gateway.GetFinalizers(), finalizerName))
			if err := r.Update(ctx, gateway); err != nil {
				return ctrl.Result{}, err
			}
			_log.Info("added finalizer", "finalizer", finalizerName)
		}

		// if bucket route is not exist, create it
		if _, ok := gateway.Status.BucketRoutes[bucketName]; ok {
			continue
		}

		// get bucket
		bucket := ossv1.Bucket{}
		err := r.Get(ctx, client.ObjectKey{Namespace: gateway.Namespace, Name: bucketName}, &bucket)
		if err != nil {
			return ctrl.Result{}, err
		}
		// get user
		user := ossv1.User{}
		err = r.Get(ctx, client.ObjectKey{Namespace: gateway.Namespace, Name: bucket.Status.User}, &user)
		if err != nil {
			return ctrl.Result{}, err
		}
		// get store
		store := ossv1.Store{}
		err = r.Get(ctx, client.ObjectKey{Namespace: gateway.Namespace, Name: user.Status.StoreName}, &store)
		if err != nil {
			return ctrl.Result{}, err
		}
		// select bucket domain
		bucketDomain, err := r.selectDomain(ctx, gatewayv1.BUCKET, store.Spec.Region)
		if err != nil {
			return ctrl.Result{}, err
		}
		if bucketDomain == nil {
			_log.Info("no bucket domain found")
			continue
		}

		gateway.Status.BucketRoutes[bucketName] = &gatewayv1.GatewayRoute{
			DomainName:      bucketDomain.Name,
			DomainNamespace: bucketDomain.Namespace,
			Domain:          gateway.Spec.AppId + "-" + bucketName + "." + bucketDomain.Spec.Domain,
		}

		// create bucket route
		bucketRoute := &gatewayv1.Route{
			ObjectMeta: ctrl.ObjectMeta{
				Name:      "bucket-" + bucketName,
				Namespace: gateway.Spec.AppId,
			},
			Spec: gatewayv1.RouteSpec{
				Domain:          gateway.Status.BucketRoutes[bucketName].Domain,
				DomainName:      bucketDomain.Name,
				DomainNamespace: bucketDomain.Namespace,
				Backend: gatewayv1.Backend{
					ServiceName: user.Status.Endpoint,
					ServicePort: 0, // If set to 0, the port is not used
				},
				PassHost: bucketName + "." + user.Status.Endpoint,
			},
		}
		if err := r.Create(ctx, bucketRoute); err != nil {
			return ctrl.Result{}, err
		}

		// update gateway status
		if err := r.Status().Update(ctx, gateway); err != nil {
			return ctrl.Result{}, err
		}
	}

	return ctrl.Result{}, nil
}

// deleteBucket delete bucket
func (r *GatewayReconciler) deleteBucket(ctx context.Context, gateway *gatewayv1.Gateway) (ctrl.Result, error) {
	_ = log.FromContext(ctx)

	// convert gateway buckets to map
	bucketMap := make(map[string]bool, 0)
	for _, bucketName := range gateway.Spec.Buckets {
		bucketMap[bucketName] = true
	}

	// find deleted bucket, remote route and finalizer
	for bucketName, _ := range gateway.Status.BucketRoutes {
		if _, ok := bucketMap[bucketName]; !ok {
			// delete route
			route := &gatewayv1.Route{}
			err := r.Get(ctx, client.ObjectKey{Namespace: gateway.Spec.AppId, Name: "bucket-" + bucketName}, route)
			if err != nil {
				return ctrl.Result{}, err
			}
			if err := r.Delete(ctx, route); err != nil {
				return ctrl.Result{}, err
			}
			// delete finalizer
			finalizerName := bucketName + ".bucket.gateway.laf.dev"
			gateway.SetFinalizers(util.RemoveString(gateway.GetFinalizers(), finalizerName))
			if err := r.Update(ctx, gateway); err != nil {
				return ctrl.Result{}, err
			}

			// delete bucket route
			delete(gateway.Status.BucketRoutes, bucketName)
		}
	}

	return ctrl.Result{}, nil
}

func (r *GatewayReconciler) selectDomain(ctx context.Context, backendType gatewayv1.BackendType, region string) (*gatewayv1.Domain, error) {
	_ = log.FromContext(ctx)

	// get all domains
	var domains gatewayv1.DomainList
	if err := r.List(ctx, &domains); err != nil {
		return nil, err
	}

	// select domain
	for _, domain := range domains.Items {
		if domain.Spec.BackendType != backendType {
			continue
		}

		if domain.Spec.Region != region {
			continue
		}
		return &domain, nil
	}
	return nil, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *GatewayReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&gatewayv1.Gateway{}).
		Complete(r)
}
