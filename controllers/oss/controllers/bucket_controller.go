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
	"github.com/labring/laf/controllers/oss/driver"
	"github.com/labring/laf/pkg/util"
	"github.com/minio/minio-go/v7"
	"time"

	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	ossv1 "github.com/labring/laf/controllers/oss/api/v1"
)

const bucketFinalizer = "bucket.oss.laf.dev"

// BucketReconciler reconciles a Bucket object
type BucketReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=oss.laf.dev,resources=buckets,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=oss.laf.dev,resources=buckets/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=oss.laf.dev,resources=buckets/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Bucket object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.12.2/pkg/reconcile
func (r *BucketReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {

	// get the bucket
	var bucket ossv1.Bucket
	if err := r.Get(ctx, req.NamespacedName, &bucket); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// reconcile deletions
	if !bucket.ObjectMeta.DeletionTimestamp.IsZero() {
		return r.delete(ctx, &bucket)
	}

	return r.apply(ctx, &bucket)
}

// apply the bucket
func (r *BucketReconciler) apply(ctx context.Context, bucket *ossv1.Bucket) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// add finalizer if not present
	if !util.ContainsString(bucket.ObjectMeta.Finalizers, bucketFinalizer) {
		bucket.ObjectMeta.Finalizers = append(bucket.ObjectMeta.Finalizers, bucketFinalizer)
		if err := r.Update(ctx, bucket); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("Added finalizer to bucket", "finalizer", bucketFinalizer)
	}

	// reconcile the bucket user
	if bucket.Status.User == "" {
		if err := r.createBucket(ctx, bucket); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("Created bucket", "bucket", bucket.Name)
	}

	// reconcile the versioning
	if !bucket.Status.Versioning {
		if err := r.enableVersioning(ctx, bucket); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("Enabled versioning", "bucket", bucket.Name)
	}

	// reconcile the policy
	if bucket.Status.Policy != bucket.Spec.Policy {
		if err := r.setBucketPolicy(ctx, bucket); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("Set bucket policy", "bucket", bucket.Name, "policy", bucket.Spec.Policy)
	}

	// reconcile the quota
	if bucket.Status.Capacity.MaxStorage.Cmp(bucket.Spec.Storage) != 0 {
		if err := r.setBucketQuota(ctx, bucket); err != nil {
			return ctrl.Result{}, err
		}
		_log.Info("Set bucket quota", "bucket", bucket.Name, "quota", bucket.Spec.Storage.String())
	}

	// TODO: sync the bucket capacity

	return ctrl.Result{RequeueAfter: time.Minute * 15}, nil
}

// delete the bucket
func (r *BucketReconciler) delete(ctx context.Context, bucket *ossv1.Bucket) (ctrl.Result, error) {
	_log := log.FromContext(ctx)

	// create the minio admin client
	mca, err := r.createMinioClient(ctx, bucket)
	if err != nil {
		return ctrl.Result{}, err
	}

	// delete the bucket
	if err := mca.DeleteBucket(bucket.Name); err != nil {
		// reject if the bucket is not exists
		if minio.ToErrorResponse(err).Code != "NoSuchBucket" {
			return ctrl.Result{}, nil
		}
	}

	// remove the finalizer
	bucket.ObjectMeta.Finalizers = util.RemoveString(bucket.ObjectMeta.Finalizers, bucketFinalizer)
	if err := r.Update(ctx, bucket); err != nil {
		return ctrl.Result{}, err
	}

	_log.Info("Deleted bucket", "bucket", bucket.Name)
	return ctrl.Result{}, nil
}

// setBucketQuota - set bucket quota
func (r *BucketReconciler) setBucketQuota(ctx context.Context, bucket *ossv1.Bucket) error {
	// create the minio client
	mca, err := r.createMinioClient(ctx, bucket)
	if err != nil {
		return err
	}

	// set bucket quota
	if err := mca.SetBucketQuota(bucket.Name, bucket.Spec.Storage); err != nil {
		return err
	}

	// update the status
	bucket.Status.Capacity.MaxStorage = bucket.Spec.Storage
	if err := r.Status().Update(ctx, bucket); err != nil {
		return err
	}

	return nil
}

// setBucketPolicy - set bucket policy
func (r *BucketReconciler) setBucketPolicy(ctx context.Context, bucket *ossv1.Bucket) error {
	// create the minio client
	mca, err := r.createMinioClient(ctx, bucket)
	if err != nil {
		return err
	}

	// set bucket policy
	if err := mca.SetBucketPolicy(bucket.Name, bucket.Spec.Policy); err != nil {
		return err
	}

	// update the status
	bucket.Status.Policy = bucket.Spec.Policy
	if err := r.Status().Update(ctx, bucket); err != nil {
		return err
	}

	return nil
}

// enableVersioning enables versioning
func (r *BucketReconciler) enableVersioning(ctx context.Context, bucket *ossv1.Bucket) error {
	// create the minio client
	mca, err := r.createMinioClient(ctx, bucket)
	if err != nil {
		return err
	}

	// enable versioning
	if err := mca.EnableVersioning(bucket.Name); err != nil {
		return err
	}

	// update the status
	bucket.Status.Versioning = true
	if err := r.Status().Update(ctx, bucket); err != nil {
		return err
	}

	return nil
}

// createBucket creates a bucket
func (r *BucketReconciler) createBucket(ctx context.Context, bucket *ossv1.Bucket) error {
	// get the user
	user, err := r.getUser(ctx, bucket)
	if err != nil {
		return err
	}

	// get the store of user
	var store ossv1.Store
	if err := r.Get(ctx, client.ObjectKey{Namespace: user.Status.StoreNamespace, Name: user.Status.StoreName}, &store); err != nil {
		return err
	}

	// create minio client
	mca, err := driver.NewMinioClientAdmin(ctx, store.Spec.Endpoint, store.Spec.AccessKey, store.Spec.SecretKey, store.Spec.UseSSL)
	if err != nil {
		return err
	}

	// create the bucket
	if err := mca.CreateBucket(bucket.Name, store.Spec.Region, true); err != nil {
		return err
	}

	// update the status
	bucket.Status.User = user.Name
	if err := r.Status().Update(ctx, bucket); err != nil {
		return err
	}
	return nil
}

// createMinioClient creates a minio client
func (r *BucketReconciler) createMinioClient(ctx context.Context, bucket *ossv1.Bucket) (*driver.MinioClientAdmin, error) {
	// get the user
	user, err := r.getUser(ctx, bucket)
	if err != nil {
		return nil, err
	}

	// get the store of user
	var store ossv1.Store
	if err := r.Get(ctx, client.ObjectKey{Namespace: user.Status.StoreNamespace, Name: user.Status.StoreName}, &store); err != nil {
		return nil, err
	}

	// create minio client
	mca, err := driver.NewMinioClientAdmin(ctx, store.Spec.Endpoint, store.Spec.AccessKey, store.Spec.SecretKey, store.Spec.UseSSL)
	if err != nil {
		return nil, err
	}

	return mca, nil
}

// getUser gets the user
func (r *BucketReconciler) getUser(ctx context.Context, bucket *ossv1.Bucket) (*ossv1.User, error) {
	// get user list in the namespace of bucket
	var userList ossv1.UserList
	if err := r.List(ctx, &userList, client.InNamespace(bucket.Namespace)); err != nil {
		return nil, err
	}

	if userList.Items == nil || len(userList.Items) == 0 {
		return nil, errors.New("no user found")
	}

	// get the first user
	user := userList.Items[0]
	return &user, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *BucketReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&ossv1.Bucket{}).
		Complete(r)
}
