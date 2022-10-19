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
	"github.com/labring/laf/pkg/util"
	"github/labring/laf/controllers/instance/driver"
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

	instancev1 "github/labring/laf/controllers/instance/api/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
)

// InstanceReconciler reconciles a Instance object
type InstanceReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

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

	// reconcile the instance
	if instance.Status.ClusterName == "" {
		// select cluster
		if err := r.selectCluster(ctx, &instance); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("select cluster [" + instance.Status.ClusterName + "]")
	}

	if instance.Spec.State == instancev1.InstanceStateRunning {
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
			Reason:             "No cluster select",
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
		instance.Status.Status = instancev1.InstanceStateRunning
		if err := r.Status().Update(ctx, instance); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("instance is ready")
		return ctrl.Result{}, nil
	}

	if util.ConditionIsNotTrue(instance.Status.Conditions, instancev1.DeploymentAndServiceCreated) {
		if err := r.deployInstanceToCluster(ctx, instance); err != nil {
			return ctrl.Result{}, err
		}
		util.SetCondition(&instance.Status.Conditions, metav1.Condition{
			Type:               instancev1.DeploymentAndServiceCreating,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "DeploymentAndServiceCreating",
			Message:            "The deployment and service are DeploymentAndServiceCreating",
		})
	}
	if util.ConditionIsTrue(instance.Status.Conditions, instancev1.DeploymentAndServiceCreating) {
		// todo check deployment and service is ready
		util.SetCondition(&instance.Status.Conditions, metav1.Condition{
			Type:               instancev1.Ready,
			Status:             metav1.ConditionTrue,
			LastTransitionTime: metav1.Now(),
			Reason:             "Ready",
			Message:            "The deployment and service Ready",
		})
		err := r.Status().Update(ctx, instance)
		if err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("instance created")
		return ctrl.Result{}, nil
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
	var defaultTerminationGracePeriodSeconds int64 = 15
	deploymentName := fmt.Sprintf("%s-deployment", instance.Name)
	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:   deploymentName,
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
							Image:   instance.Spec.Runtime.Image.Main,
							Command: []string{"sh", "/app/start.sh"},
							Env:     r.buildEnv(ctx, instance),
							Ports: []corev1.ContainerPort{
								{ContainerPort: 8000, Name: "http"},
							},
							Resources: corev1.ResourceRequirements{
								Requests: r.setRequestQuota(ctx, instance.Spec.Bundle),
								Limits:   r.setLimitQuota(ctx, instance.Spec.Bundle),
							},
							StartupProbe:   r.buildProbe(0, 3, 3, 240, "startupProbe"),
							ReadinessProbe: r.buildProbe(0, 60, 5, 3, "readinessProbe"),
						},
					},
				},
			},
		},
	}
	_, err = kubernetesClient.AppsV1().Deployments(instance.Namespace).Get(ctx, deploymentName, metav1.GetOptions{})
	if apierrors.IsAlreadyExists(err) {
		// todo update deployment
	} else {
		_, err = kubernetesClient.AppsV1().Deployments(instance.Namespace).Create(ctx, deployment, metav1.CreateOptions{})
	}
	return err
}

func (r *InstanceReconciler) applySvc(ctx context.Context, kubernetesClient *kubernetes.Clientset, labels map[string]string, instance *instancev1.Instance) (err error) {
	svcName := fmt.Sprintf("%s-svc", instance.Name)
	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:   svcName,
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
	_, err = kubernetesClient.CoreV1().Services(instance.Namespace).Get(ctx, svcName, metav1.GetOptions{})
	if apierrors.IsAlreadyExists(err) {
		// todo update svc
	} else {
		_, err = kubernetesClient.CoreV1().Services(instance.Namespace).Create(ctx, svc, metav1.CreateOptions{})
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

func (r *InstanceReconciler) buildEnv(ctx context.Context, instance *instancev1.Instance) []corev1.EnvVar {
	// todo fix env
	return []corev1.EnvVar{
		{
			Name:  "DB",
			Value: "test",
		},
	}
}

func (r *InstanceReconciler) setRequestQuota(ctx context.Context, bundle appv1.BundleSpec) corev1.ResourceList {
	return map[corev1.ResourceName]resource.Quantity{
		corev1.ResourceCPU:    bundle.RequestCPU,
		corev1.ResourceMemory: bundle.RequestMemory,
	}
}

func (r *InstanceReconciler) setLimitQuota(ctx context.Context, bundle appv1.BundleSpec) corev1.ResourceList {
	return map[corev1.ResourceName]resource.Quantity{
		corev1.ResourceCPU:    bundle.LimitCPU,
		corev1.ResourceMemory: bundle.LimitMemory,
	}
}

func (r *InstanceReconciler) buildProbe(initialDelaySeconds, periodSeconds, timeoutSeconds, failureThreshold int32, probeType string) *corev1.Probe {
	return &corev1.Probe{
		ProbeHandler: corev1.ProbeHandler{
			HTTPGet: &corev1.HTTPGetAction{
				Path:        "/healthz",
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
