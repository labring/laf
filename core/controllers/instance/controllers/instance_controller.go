package controllers

import (
	"context"
	"fmt"
	"github/labring/laf/core/controllers/instance/driver"
	"time"

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
	if kubernetesClient, err = driver.GetKubernetesClient(); err != nil {
		return err
	}

	if err = createNamespaceIfNotExist(ctx, kubernetesClient, instance.Namespace); err != nil {
		return err
	}

	labels := map[string]string{
		"appid": instance.Spec.AppId,
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
	env := []corev1.EnvVar{
		{Name: "DB_URI", Value: instance.Spec.DatabaseConnectionUri},
		{Name: "SERVER_SECRET_SALT", Value: ""}, // todo SERVER_SECRET_SALT
		{Name: "APP_ID", Value: instance.Spec.AppId},
		{Name: "RUNTIME_IMAGE", Value: instance.Spec.Runtime.Image.Main},
		{Name: "FLAGS", Value: fmt.Sprintf("--max_old_space_size=%v", float32(instance.Spec.Bundle.LimitMemory.Value())*0.8)},
		{Name: "NPM_INSTALL_FLAGS", Value: ""}, // todo NPM_INSTALL_FLAGS
		{Name: "OSS_ACCESS_KEY", Value: instance.Spec.OssAccess.AccessKey},
		{Name: "OSS_ACCESS_SECRET", Value: instance.Spec.OssAccess.SecretKey},
		{Name: "OSS_INTERNAL_ENDPOINT", Value: instance.Spec.OssAccess.InternalEndpoint},
		{Name: "OSS_EXTERNAL_ENDPOINT", Value: instance.Spec.OssAccess.Endpoint},
		{Name: "OSS_REGION", Value: instance.Spec.OssAccess.Region},
	}
	var defaultTerminationGracePeriodSeconds int64 = 15
	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:   getDeploymentName(instance),
			Labels: labels,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &instance.Spec.Replica,
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
							Env:     env,
							Ports: []corev1.ContainerPort{
								{ContainerPort: 8000, Name: "http"},
							},
							Resources: corev1.ResourceRequirements{
								Requests: map[corev1.ResourceName]resource.Quantity{
									corev1.ResourceCPU:    instance.Spec.Bundle.RequestCPU,
									corev1.ResourceMemory: instance.Spec.Bundle.RequestMemory,
								},
								Limits: map[corev1.ResourceName]resource.Quantity{
									corev1.ResourceCPU:    instance.Spec.Bundle.LimitCPU,
									corev1.ResourceMemory: instance.Spec.Bundle.LimitMemory,
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
	if kubernetesClient, err = driver.GetKubernetesClient(); err != nil {
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

func (r *InstanceReconciler) delete(ctx context.Context, instance *instancev1.Instance) (ctrl.Result, error) {

	err := r.deleteInstanceFromCluster(ctx, instance)
	return ctrl.Result{}, err
}

func (r *InstanceReconciler) checkPodStatus(ctx context.Context, instance *instancev1.Instance) (bool, *appsv1.Deployment) {
	var kubernetesClient *kubernetes.Clientset
	var err error
	var result *appsv1.Deployment
	if kubernetesClient, err = driver.GetKubernetesClient(); err != nil {
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

func getDeploymentName(instance *instancev1.Instance) string {
	return fmt.Sprintf("%s-deployment", instance.Name)
}

func getSvcName(instance *instancev1.Instance) string {
	return fmt.Sprintf("%s-svc", instance.Name)
}
