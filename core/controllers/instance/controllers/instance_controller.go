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
	"github/labring/laf/core/controllers/instance/driver"
	"time"

	databasev1 "github.com/labring/laf/core/controllers/database/api/v1"
	ossv1 "github.com/labring/laf/core/controllers/oss/api/v1"
	runtimev1 "github.com/labring/laf/core/controllers/runtime/api/v1"
	"k8s.io/apimachinery/pkg/types"

	applicationv1 "github.com/labring/laf/core/controllers/application/api/v1"
	"github.com/labring/laf/core/pkg/util"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	instancev1 "github/labring/laf/core/controllers/instance/api/v1"

	apierrors "k8s.io/apimachinery/pkg/api/errors"
)

// InstanceReconciler reconciles a Instance object
type InstanceReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

const InstanceFinalizer = "instance.finalizers.laf.dev"

//+kubebuilder:rbac:groups=instance.laf.dev,resources=instances,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=instance.laf.dev,resources=instances/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=instance.laf.dev,resources=instances/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Instance object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.2/pkg/reconcile
func (r *InstanceReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	_log.Info("reconciling instance")

	// get instance
	var instance instancev1.Instance
	if err := r.Get(ctx, req.NamespacedName, &instance); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// reconcile the deletion
	if !instance.DeletionTimestamp.IsZero() {
		_log.Info("deleting instance", "instance", instance.Name)
		return r.delete(ctx, &instance)
	}

	if instance.Spec.State == instancev1.InstanceStateRunning {
		// reconcile the instance
		if instance.Status.ClusterName == "" {
			// select cluster
			if err := r.selectCluster(ctx, &instance); err != nil {
				return ctrl.Result{}, err
			}
			_log.Info("select cluster [" + instance.Status.ClusterName + "]")
		}
		return r.runInstance(ctx, &instance)
	}
	if instance.Spec.State == instancev1.InstanceStateStopped {
		return r.stopInstance(ctx, &instance)
	}

	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *InstanceReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&instancev1.Instance{}).
		Complete(r)
}

// selectCluster  select a cluster for instance，return the first available cluster
func (r *InstanceReconciler) selectCluster(ctx context.Context, instance *instancev1.Instance) error {
	_log := log.FromContext(ctx)

	_log.Info("select a cluster for instance ")
	var clusterList instancev1.ClusterList
	if err := r.List(ctx, &clusterList); err != nil {
		return err
	}
	// todo Reconcile instance when cluster is changed
	var selected *instancev1.Cluster
	for _, cluster := range clusterList.Items {
		// skip if the region is not match
		if cluster.Spec.Region != instance.Spec.Region {
			continue
		}

		// todo  check cluster is ready
		// todo skip if cluster has not enough capacity

		selected = &cluster
	}
	var condition metav1.Condition
	if selected != nil {
		condition = metav1.Condition{
			Type:               instancev1.ClusterSelected,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "ClusterSelected",
			Message:            "Cluster selected",
		}
		instance.Status.ClusterName = selected.Name
		instance.Status.ClusterConfig = selected.Spec.ClientConfig
	} else {
		condition = metav1.Condition{
			Type:               instancev1.ClusterSelected,
			Status:             metav1.ConditionFalse,
			LastTransitionTime: metav1.Now(),
			Reason:             "NoClusterSelect",
			Message:            "no cluster select",
		}
	}
	util.SetCondition(&instance.Status.Conditions, condition)
	if err := r.Status().Update(ctx, instance); err != nil {
		return err
	}
	return nil
}

func (r *InstanceReconciler) runInstance(ctx context.Context, instance *instancev1.Instance) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	if util.ConditionIsTrue(instance.Status.Conditions, instancev1.Ready) {
		_, result := r.checkPodStatus(ctx, instance)
		if result != nil {
			instance.Status.ReadyReplicas = result.Status.ReadyReplicas
			instance.Status.UpdatedReplicas = result.Status.UpdatedReplicas
			instance.Status.UnavailableReplicas = result.Status.UnavailableReplicas
			instance.Status.AvailableReplicas = result.Status.AvailableReplicas
		}

		instance.Status.Status = instancev1.InstanceStateRunning
		if err := r.Status().Update(ctx, instance); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("instance is ready")
		return ctrl.Result{
			Requeue:      true,
			RequeueAfter: time.Second * 5,
		}, nil
	}
	if util.ConditionIsTrue(instance.Status.Conditions, instancev1.DeploymentAndServiceCreating) {
		podStatus, result := r.checkPodStatus(ctx, instance)
		if podStatus {
			util.SetCondition(&instance.Status.Conditions, metav1.Condition{
				Type:               instancev1.Ready,
				Status:             metav1.ConditionTrue,
				LastTransitionTime: metav1.Now(),
				Reason:             "Ready",
				Message:            "The deployment and service Ready",
			})
			instance.Status.ReadyReplicas = result.Status.ReadyReplicas
			instance.Status.UpdatedReplicas = result.Status.UpdatedReplicas
			instance.Status.UnavailableReplicas = result.Status.UnavailableReplicas
			instance.Status.AvailableReplicas = result.Status.AvailableReplicas
			err := r.Status().Update(ctx, instance)
			if err != nil {
				return ctrl.Result{}, err
			}
			_log.Info("The deployment and service Ready")
		}
		return ctrl.Result{
			Requeue:      true,
			RequeueAfter: time.Second * 1,
		}, nil
	}
	if util.ConditionIsNotTrue(instance.Status.Conditions, instancev1.DeploymentAndServiceCreated) {
		if err := r.deployInstanceToCluster(ctx, instance); err != nil {
			return ctrl.Result{}, err
		}
		// update status deploymentName and svcName
		instance.Status.DeploymentName = getDeploymentName(instance)
		instance.Status.ServiceName = getSvcName(instance)
		util.SetCondition(&instance.Status.Conditions, metav1.Condition{
			Type:               instancev1.DeploymentAndServiceCreating,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "DeploymentAndServiceCreating",
			Message:            "The deployment and service are DeploymentAndServiceCreating",
		})
		err := r.Status().Update(ctx, instance)
		if err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("the deployment and service are DeploymentAndServiceCreating")
	}
	return ctrl.Result{}, nil
}

func (r *InstanceReconciler) stopInstance(ctx context.Context, instance *instancev1.Instance) (ctrl.Result, error) {
	_log := log.FromContext(ctx)
	if util.ConditionIsNotTrue(instance.Status.Conditions, instancev1.DeploymentAndServiceStopped) {
		if err := r.deleteInstanceFromCluster(ctx, instance); err != nil {
			return ctrl.Result{}, err
		}
		condition := metav1.Condition{
			Type:               instancev1.DeploymentAndServiceStopping,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "DeploymentAndServiceStopping",
			Message:            "The deployment and service are stopping",
		}
		util.SetCondition(&instance.Status.Conditions, condition)
		err := r.Status().Update(ctx, instance)
		if err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("The deployment and service are stopping")
		return ctrl.Result{}, nil
	}
	if util.ConditionIsTrue(instance.Status.Conditions, instancev1.DeploymentAndServiceStopping) {
		// todo check deployment and service removed  from cluster
		condition := metav1.Condition{
			Type:               instancev1.DeploymentAndServiceStopped,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "DeploymentAndServiceStopped",
			Message:            "The deployment and service are stopped",
		}
		util.SetCondition(&instance.Status.Conditions, condition)
		instance.Status.Status = instancev1.InstanceStateStopped
		err := r.Status().Update(ctx, instance)
		if err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("The deployment and service are stopped")
		return ctrl.Result{}, nil
	}
	return ctrl.Result{}, nil
}

func (r *InstanceReconciler) deployInstanceToCluster(ctx context.Context, instance *instancev1.Instance) (err error) {
	var kubernetesClient *kubernetes.Clientset
	if kubernetesClient, err = driver.GetKubernetesClient(instance.Status.ClusterConfig); err != nil {
		return err
	}

	if err = createNamespaceIfNotExist(ctx, kubernetesClient, instance.Namespace); err != nil {
		return err
	}

	labels := map[string]string{
		"appid":  instance.Spec.AppId,
		"region": instance.Spec.Region,
	}
	if err := r.applyDeployment(ctx, kubernetesClient, labels, instance); err != nil {
		return err
	}

	if err := r.applySvc(ctx, kubernetesClient, labels, instance); err != nil {
		return err
	}
	return nil
}

func (r *InstanceReconciler) applyDeployment(ctx context.Context, kubernetesClient *kubernetes.Clientset, labels map[string]string, instance *instancev1.Instance) (err error) {
	// get bundle for request/limit cpu etc.
	var bundle *applicationv1.Bundle
	if bundle, err = r.getBundle(ctx, instance); err != nil {
		return err
	}

	// get runtime
	var rt *runtimev1.Runtime
	if rt, err = r.getRuntime(ctx, instance); err != nil {
		return err
	}

	// Get database from current namespace,
	var database *databasev1.Database
	if database, err = r.getDatabase(ctx, instance); err != nil {
		return err
	}
	// Get database from current namespace,

	var ossUser *ossv1.User
	if ossUser, err = r.getOssUser(ctx, instance); err != nil {
		return err
	}

	env := []corev1.EnvVar{
		{Name: "DB", Value: database.Status.StoreName},
		{Name: "DB_URI", Value: database.Status.ConnectionUri},
		{Name: "LOG_LEVEL", Value: "DEBUG"}, //todo dynamic value
		{Name: "ENABLE_CLOUD_FUNCTION_LOG", Value: "always"},
		{Name: "SERVER_SECRET_SALT", Value: ""}, // todo SERVER_SECRET_SALT
		{Name: "APP_ID", Value: instance.Spec.AppId},
		{Name: "RUNTIME_IMAGE", Value: rt.Spec.Image.Main},
		{Name: "FLAGS", Value: fmt.Sprintf("--max_old_space_size=%v", float32(bundle.Spec.LimitMemory.Value())*0.8)},
		{Name: "NPM_INSTALL_FLAGS", Value: ""}, // todo NPM_INSTALL_FLAGS
		{Name: "OSS_ACCESS_SECRET", Value: ossUser.Status.AccessKey},
		{Name: "OSS_INTERNAL_ENDPOINT", Value: ossUser.Status.Endpoint},
		{Name: "OSS_EXTERNAL_ENDPOINT", Value: ossUser.Status.Endpoint}, // todo OSS_EXTERNAL_ENDPOINT
		{Name: "OSS_REGION", Value: ossUser.Status.Region},              // todo OSS_EXTERNAL_ENDPOINT
	}
	var defaultTerminationGracePeriodSeconds int64 = 15
	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:   getDeploymentName(instance),
			Labels: labels,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: instance.Spec.Replica,
			Selector: &metav1.LabelSelector{
				MatchLabels: labels,
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: labels,
				},
				Spec: corev1.PodSpec{
					TerminationGracePeriodSeconds: &defaultTerminationGracePeriodSeconds,
					Containers: []corev1.Container{ // todo 是否还有其他的容器需要初始化，类似initContainer
						{
							Name:    "main",
							Image:   rt.Spec.Image.Main,
							Command: []string{"sh", "/app/start.sh"},
							Env:     env,
							Ports: []corev1.ContainerPort{
								{ContainerPort: 8000, Name: "http"},
							},
							Resources: corev1.ResourceRequirements{
								Requests: map[corev1.ResourceName]resource.Quantity{
									corev1.ResourceCPU:    bundle.Spec.RequestCPU,
									corev1.ResourceMemory: bundle.Spec.RequestMemory,
								},
								Limits: map[corev1.ResourceName]resource.Quantity{
									corev1.ResourceCPU:    bundle.Spec.LimitCPU,
									corev1.ResourceMemory: bundle.Spec.LimitMemory,
								},
							},
							StartupProbe:   r.buildProbe(0, 3, 3, 240, "startupProbe"),
							ReadinessProbe: r.buildProbe(0, 60, 5, 3, "readinessProbe"),
						},
					},
				},
			},
		},
	}
	_, err = kubernetesClient.AppsV1().Deployments(instance.Namespace).Get(ctx, getDeploymentName(instance), metav1.GetOptions{})
	if apierrors.IsNotFound(err) {
		_, err = kubernetesClient.AppsV1().Deployments(instance.Namespace).Create(ctx, deployment, metav1.CreateOptions{})
	} else {
		// todo update deployment
	}
	return err
}

// applySvc Apply service
func (r *InstanceReconciler) applySvc(ctx context.Context, kubernetesClient *kubernetes.Clientset, labels map[string]string, instance *instancev1.Instance) (err error) {
	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:   getSvcName(instance),
			Labels: labels,
		},
		Spec: corev1.ServiceSpec{
			Selector: labels,
			Type:     corev1.ServiceTypeClusterIP,
			Ports: []corev1.ServicePort{
				{
					TargetPort: intstr.FromInt(8000),
					Port:       8000,
				},
			},
		},
	}
	_, err = kubernetesClient.CoreV1().Services(instance.Namespace).Get(ctx, getSvcName(instance), metav1.GetOptions{})
	if apierrors.IsNotFound(err) {
		_, err = kubernetesClient.CoreV1().Services(instance.Namespace).Create(ctx, svc, metav1.CreateOptions{})
	} else {
		// todo update svc
	}
	return err
}
func createNamespaceIfNotExist(ctx context.Context, kubernetesClient *kubernetes.Clientset, namespace string) error {
	ns := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: namespace,
		},
	}
	_, err := kubernetesClient.CoreV1().Namespaces().Get(context.TODO(), namespace, metav1.GetOptions{})
	if err != nil {
		_, err = kubernetesClient.CoreV1().Namespaces().Create(ctx, ns, metav1.CreateOptions{})
	}

	return err
}

func (r *InstanceReconciler) deleteInstanceFromCluster(ctx context.Context, instance *instancev1.Instance) (err error) {
	var kubernetesClient *kubernetes.Clientset
	if kubernetesClient, err = driver.GetKubernetesClient(instance.Status.ClusterConfig); err != nil {
		return err
	}
	if err = kubernetesClient.AppsV1().Deployments(instance.Namespace).Delete(ctx, instance.Status.DeploymentName, metav1.DeleteOptions{}); client.IgnoreNotFound(err) != nil {
		return err
	}
	if err = kubernetesClient.CoreV1().Services(instance.Namespace).Delete(ctx, instance.Status.ServiceName, metav1.DeleteOptions{}); client.IgnoreNotFound(err) != nil {
		return err
	}
	return nil
}

func (r *InstanceReconciler) buildProbe(initialDelaySeconds, periodSeconds, timeoutSeconds, failureThreshold int32, probeType string) *corev1.Probe {
	return &corev1.Probe{
		ProbeHandler: corev1.ProbeHandler{
			HTTPGet: &corev1.HTTPGetAction{
				//Path: "/healthz",
				Path:        "/",
				Port:        intstr.FromString("http"),
				HTTPHeaders: []corev1.HTTPHeader{{Name: "Referer", Value: probeType}},
			},
		},
		InitialDelaySeconds: initialDelaySeconds,
		PeriodSeconds:       periodSeconds,
		TimeoutSeconds:      timeoutSeconds,
		FailureThreshold:    failureThreshold,
	}
}

func (r *InstanceReconciler) delete(ctx context.Context, instance *instancev1.Instance) (ctrl.Result, error) {

	err := r.deleteInstanceFromCluster(ctx, instance)
	return ctrl.Result{}, err
}

func (r *InstanceReconciler) checkPodStatus(ctx context.Context, instance *instancev1.Instance) (bool, *appsv1.Deployment) {
	var kubernetesClient *kubernetes.Clientset
	var err error
	var result *appsv1.Deployment
	if kubernetesClient, err = driver.GetKubernetesClient(instance.Status.ClusterConfig); err != nil {
		return false, nil
	}
	if result, err = kubernetesClient.AppsV1().Deployments(instance.Namespace).Get(ctx, instance.Status.DeploymentName, metav1.GetOptions{}); client.IgnoreNotFound(err) != nil {
		return false, nil
	}

	if result.Status.Replicas > 0 && float32(result.Status.ReadyReplicas/result.Status.Replicas) >= 0.5 {
		return true, result
	}
	return false, result
}

// getBundle Get bundle with instance spec
func (r *InstanceReconciler) getBundle(ctx context.Context, instance *instancev1.Instance) (*applicationv1.Bundle, error) {
	namespaceName := types.NamespacedName{
		Namespace: instance.Spec.Bundle,
		Name:      instance.Spec.BundleNamespace,
	}
	bundle := new(applicationv1.Bundle)
	err := r.Client.Get(ctx, namespaceName, bundle)
	return bundle, err
}

// getRuntime Get runtime with instance spec
func (r *InstanceReconciler) getRuntime(ctx context.Context, instance *instancev1.Instance) (*runtimev1.Runtime, error) {
	namespaceName := types.NamespacedName{
		Namespace: instance.Spec.RuntimeName,
		Name:      instance.Spec.RuntimeNamespace,
	}
	rt := new(runtimev1.Runtime)
	err := r.Client.Get(ctx, namespaceName, rt)
	return rt, err
}

func (r *InstanceReconciler) getDatabase(ctx context.Context, instance *instancev1.Instance) (*databasev1.Database, error) {
	namespaceName := types.NamespacedName{
		Namespace: instance.Spec.Database,
		Name:      instance.Spec.DatabaseNamespace,
	}
	database := new(databasev1.Database)
	err := r.Client.Get(ctx, namespaceName, database)
	return database, err
}

func (r *InstanceReconciler) getOssUser(ctx context.Context, instance *instancev1.Instance) (*ossv1.User, error) {
	namespaceName := types.NamespacedName{
		Namespace: instance.Spec.OssUser,
		Name:      instance.Spec.OssUserNamespace,
	}
	ossUser := new(ossv1.User)
	err := r.Client.Get(ctx, namespaceName, ossUser)
	return ossUser, err
}

func getDeploymentName(instance *instancev1.Instance) string {
	return fmt.Sprintf("%s-deployment", instance.Name)
}

func getSvcName(instance *instancev1.Instance) string {
	return fmt.Sprintf("%s-svc", instance.Name)
}
