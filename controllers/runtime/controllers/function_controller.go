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
	databasev1 "github.com/labring/laf/controllers/database/api/v1"
	"github.com/labring/laf/controllers/runtime/dbm"
	"github.com/labring/laf/pkg/util"
	"k8s.io/apimachinery/pkg/types"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	runtimev1 "github.com/labring/laf/controllers/runtime/api/v1"
)

const functionFinalizer = "function.runtime.laf.io"

// FunctionReconciler reconciles a Function object
type FunctionReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=runtime.laf.dev,resources=functions,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=runtime.laf.dev,resources=functions/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=runtime.laf.dev,resources=functions/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Function object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.2/pkg/reconcile
func (r *FunctionReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)

	// get app database
	database := &databasev1.Database{}
	databaseName := "mongodb"
	err := r.Get(ctx, types.NamespacedName{Namespace: req.Namespace, Name: databaseName}, database)
	if err != nil {
		return ctrl.Result{}, err
	}
	fm, err := dbm.NewFunctionManager(ctx, database.Status.ConnectionUri, database.Name)
	if err != nil {
		return ctrl.Result{}, err
	}
	defer fm.Disconnect()

	// get function
	function := &runtimev1.Function{}
	err = r.Get(ctx, req.NamespacedName, function)
	if err != nil {
		return ctrl.Result{}, err
	}

	if !function.DeletionTimestamp.IsZero() {
		return r.Delete(ctx, function, fm)
	}

	return r.apply(ctx, function, fm)
}

func (r *FunctionReconciler) apply(ctx context.Context, function *runtimev1.Function, fm *dbm.FunctionManager) (ctrl.Result, error) {

	// add finalizer if not present
	if controllerutil.AddFinalizer(function, functionFinalizer) {
		if err := r.Update(ctx, function); err != nil {
			return ctrl.Result{}, err
		}
		return ctrl.Result{}, nil
	}

	//get database functionData
	functionData, err := fm.Get(function.Name)
	if err != nil {
		return ctrl.Result{}, err
	}

	// if functionData is nil, create function
	if functionData == nil {
		err := fm.Insert(dbm.FunctionData{
			Name:        function.Name,
			Description: function.Spec.Description,
			Code:        function.Spec.Source.Codes,
			Methods:     function.Spec.Methods,
			Websocket:   function.Spec.Websocket,
			Version:     function.Spec.Source.Version,
		})
		if err != nil {
			return ctrl.Result{}, err
		}

		// update function status
		function.Status = runtimev1.FunctionStatus{
			State: "Deployed",
		}
		if err := r.Status().Update(ctx, function); err != nil {
			return ctrl.Result{}, err
		}
		return ctrl.Result{}, nil
	}

	// if functionData is not nil, check need update
	updateMap := make(map[string]interface{})
	if functionData.Version != function.Spec.Source.Version {
		updateMap["version"] = function.Spec.Source.Version
		updateMap["code"] = function.Spec.Source.Codes
	}
	if functionData.Description != function.Spec.Description {
		updateMap["description"] = function.Spec.Description
	}
	if !util.EqualsSlice(functionData.Methods, function.Spec.Methods) {
		updateMap["methods"] = function.Spec.Methods
	}
	if functionData.Websocket != function.Spec.Websocket {
		updateMap["websocket"] = function.Spec.Websocket
	}

	if len(updateMap) > 0 {
		err := fm.Update(function.Name, map[string]interface{}{
			"$set": updateMap,
		})
		if err != nil {
			return ctrl.Result{}, err
		}
		return ctrl.Result{}, nil
	}
	return ctrl.Result{}, nil
}

func (r *FunctionReconciler) Delete(ctx context.Context, function *runtimev1.Function, fm *dbm.FunctionManager) (ctrl.Result, error) {
	if err := fm.Delete(function.Name); err != nil {
		return ctrl.Result{}, err
	}
	// remove the finalizer
	if controllerutil.RemoveFinalizer(function, functionFinalizer) {
		if err := r.Update(ctx, function); err != nil {
			return ctrl.Result{}, err
		}
	}
	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *FunctionReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&runtimev1.Function{}).
		Complete(r)
}
