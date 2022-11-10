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
	"strconv"
	"time"

	"github.com/labring/laf/core/controllers/gateway/apisix"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/util/retry"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	gatewayv1 "github.com/labring/laf/core/controllers/gateway/api/v1"
)

const routeFinalizer = "route.gateway.laf.dev"

// RouteReconciler reconciles a Route object
type RouteReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=gateway.laf.dev,resources=routes,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=gateway.laf.dev,resources=routes/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=gateway.laf.dev,resources=routes/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Route object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.2/pkg/reconcile
func (r *RouteReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)

	// get the route
	var route gatewayv1.Route
	if err := r.Get(ctx, req.NamespacedName, &route); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// 获取apiSix集群操作对象
	apiSixCluster, err := r.getGatewayCluster(ctx, &route)
	if err != nil {
		return ctrl.Result{}, err
	}

	// 如果路由已经被设置删除标记，则删除路由
	if !route.ObjectMeta.DeletionTimestamp.IsZero() {
		return r.deleteRoute(ctx, &route, apiSixCluster)
	}

	return r.applyRoute(ctx, &route, apiSixCluster)
}

func (r *RouteReconciler) applyRoute(ctx context.Context, route *gatewayv1.Route, cluster *apisix.Cluster) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// add finalizer if not present
	if controllerutil.AddFinalizer(route, routeFinalizer) {
		if err := r.Update(ctx, route); err != nil {
			return ctrl.Result{}, err
		}
	}

	// get route id
	routeId := getRouteId(route)

	// set route base data
	routeData := map[string]interface{}{
		"uri":  "/*",
		"host": route.Spec.Domain,
	}

	// if port is not 0, set node to serviceName and servicePort combination
	node := route.Spec.Backend.ServiceName
	if route.Spec.Backend.ServicePort != 0 {
		node += ":" + strconv.FormatInt(int64(route.Spec.Backend.ServicePort), 10)
	}
	upstream := map[string]interface{}{
		"type": "roundrobin",
		"nodes": map[string]interface{}{
			node: 1,
		},
	}

	// set web socket
	if route.Spec.EnableWebSocket {
		routeData["enable_websocket"] = true
	}

	// set path rewrite
	if route.Spec.PathRewrite != nil {
		pathRewrite := route.Spec.PathRewrite
		routeData["plugins"] = map[string]interface{}{
			"proxy-rewrite": map[string]interface{}{
				"regex_uri": []string{
					pathRewrite.Regex,
					pathRewrite.Replacement,
				},
			},
		}
	}

	// set pass host
	if route.Spec.PassHost != "" {
		upstream["pass_host"] = "rewrite"
		upstream["upstream_host"] = route.Spec.PassHost
	}

	// set upstream to base data
	routeData["upstream"] = upstream

	// put route to apisix
	err := cluster.Route.Put(routeId, routeData)
	if err != nil {
		return ctrl.Result{RequeueAfter: time.Minute * 1}, err
	}

	// update route status
	if route.Status.Domain == "" {
		route.Status.Domain = route.Spec.Domain
		if err := r.updateStatus(ctx, types.NamespacedName{Namespace: route.Namespace, Name: route.Name}, route.Status.DeepCopy()); err != nil {
			return ctrl.Result{}, err
		}
	}

	_log.Info("route applied: " + routeId)
	return ctrl.Result{}, nil
}

func (r *RouteReconciler) deleteRoute(ctx context.Context, route *gatewayv1.Route, cluster *apisix.Cluster) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	routeId := getRouteId(route)
	err := cluster.Route.Delete(routeId)
	if err != nil {
		return ctrl.Result{RequeueAfter: time.Minute * 1}, err
	}

	// remove the finalizer
	if controllerutil.RemoveFinalizer(route, routeFinalizer) {
		if err := r.Update(ctx, route); err != nil {
			return ctrl.Result{}, err
		}
	}

	_log.Info("route deleted: " + routeId)
	return ctrl.Result{}, nil
}

func (r *RouteReconciler) getGatewayCluster(ctx context.Context, route *gatewayv1.Route) (*apisix.Cluster, error) {
	// get domain
	domain := gatewayv1.Domain{}
	if err := r.Get(ctx, types.NamespacedName{Namespace: route.Spec.DomainNamespace, Name: route.Spec.DomainName}, &domain); err != nil {
		return nil, err
	}
	cluster := apisix.NewCluster(domain.Spec.Cluster.Url, domain.Spec.Cluster.Key)
	return cluster, nil
}

func (r *RouteReconciler) updateStatus(ctx context.Context, nn types.NamespacedName, status *gatewayv1.RouteStatus) error {
	if err := retry.RetryOnConflict(retry.DefaultRetry, func() error {
		original := &gatewayv1.Route{}
		if err := r.Get(ctx, nn, original); err != nil {
			return err
		}
		original.Status = *status
		if err := r.Client.Status().Update(ctx, original); err != nil {
			return err
		}
		return nil
	}); err != nil {
		return err
	}
	return nil
}

func getRouteId(route *gatewayv1.Route) string {
	return route.Namespace + "-" + route.Name
}

// SetupWithManager sets up the controller with the Manager.
func (r *RouteReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&gatewayv1.Route{}).
		Complete(r)
}
