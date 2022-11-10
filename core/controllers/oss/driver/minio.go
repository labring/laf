package driver

import (
	"errors"
	"strings"

	v1 "github.com/labring/laf/core/controllers/oss/api/v1"
	gonanoid "github.com/matoous/go-nanoid/v2"
	"github.com/minio/madmin-go"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"golang.org/x/net/context"
	"k8s.io/apimachinery/pkg/api/resource"
)

// MinioClientAdmin is a wrapper for madmin.AdminClient
type MinioClientAdmin struct {
	adminClient *madmin.AdminClient
	s3Client    *minio.Client
	context     context.Context
}

const initialUserGroup = "owner_by_prefix_group"
const initialPolicyName = "owner_by_prefix"
const initialPolicy = `{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Effect": "Allow",
          "Action": [
              "s3:GetBucketPolicy",
              "s3:GetObject",
              "s3:ListBucket",
              "s3:ListBucketMultipartUploads",
              "s3:ListMultipartUploadParts",
              "s3:PutObject",
              "s3:DeleteObject",
              "s3:GetBucketLocation"
          ],
          "Resource": [
              "arn:aws:s3:::${aws:username}-*"
          ]
      }
  ]
}`

func NewMinioClientAdmin(context context.Context, endpoint string, accessKeyID string, secretAccessKey string, secure bool) (*MinioClientAdmin, error) {
	mca := MinioClientAdmin{context: context}

	// create minio admin client
	client, err := madmin.New(endpoint, accessKeyID, secretAccessKey, secure)
	if err != nil {
		return nil, err
	}
	mca.adminClient = client

	// create s3 client
	s3Client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: secure,
	})
	if err != nil {
		return nil, err
	}
	mca.s3Client = s3Client

	return &mca, nil
}

// GetServerInfo - returns the server info.
func (mca *MinioClientAdmin) GetServerInfo() (*madmin.InfoMessage, error) {
	stats, err := mca.adminClient.ServerInfo(mca.context)
	if err != nil {
		return nil, err
	}

	return &stats, nil
}

// CreateInitialPolicy - creates a canned policy.
func (mca *MinioClientAdmin) CreateInitialPolicy() error {
	err := mca.adminClient.AddCannedPolicy(mca.context, initialPolicyName, []byte(initialPolicy))
	if err != nil {
		return err
	}

	return nil
}

// AddUserToInitialGroup - creates a user group in minio.
func (mca *MinioClientAdmin) AddUserToInitialGroup(user string) error {
	param := madmin.GroupAddRemove{
		Group:    initialUserGroup,
		Members:  []string{user},
		IsRemove: false,
	}

	err := mca.adminClient.UpdateGroupMembers(mca.context, param)
	if err != nil {
		return err
	}

	return nil
}

// CreateInitialGroup - creates a user group in minio.
func (mca *MinioClientAdmin) CreateInitialGroup() error {
	// create a temporary user
	user := "tempUser"
	err := mca.adminClient.AddUser(mca.context, user, gonanoid.Must())
	if err != nil {
		return err
	}

	// create initial group
	err = mca.AddUserToInitialGroup(user)
	if err != nil {
		return err
	}

	// set policy for user group
	err = mca.adminClient.SetPolicy(mca.context, initialPolicyName, initialUserGroup, true)
	return nil
}

// CreateUser - creates a user in minio.
func (mca *MinioClientAdmin) CreateUser(accessKey string, secretKey string) error {
	err := mca.adminClient.AddUser(mca.context, accessKey, secretKey)
	return err
}

// DeleteUser - deletes a user in minio.
func (mca *MinioClientAdmin) DeleteUser(accessKey string) error {
	err := mca.adminClient.RemoveUser(mca.context, accessKey)
	return err
}

// CreateBucket - creates a bucket in minio.
func (mca *MinioClientAdmin) CreateBucket(bucketName string, region string, ignoreExisting bool) error {
	if ignoreExisting {
		found, err := mca.s3Client.BucketExists(mca.context, bucketName)
		if err != nil {
			return err
		}

		if found {
			return nil
		}
	}

	err := mca.s3Client.MakeBucket(mca.context, bucketName, minio.MakeBucketOptions{
		Region: region,
	})

	return err
}

// DeleteBucket - deletes a bucket in minio.
func (mca *MinioClientAdmin) DeleteBucket(bucketName string) error {
	err := mca.s3Client.RemoveBucketWithOptions(mca.context, bucketName, minio.RemoveBucketOptions{
		ForceDelete: true,
	})

	return err
}

// DataUsageInfo - returns the bucket info.
func (mca *MinioClientAdmin) DataUsageInfo(bucketName string) (*madmin.DataUsageInfo, error) {
	stats, err := mca.adminClient.DataUsageInfo(mca.context)
	if err != nil {
		return nil, err
	}

	return &stats, nil
}

// SetBucketPolicy - sets a bucket policy in minio.
func (mca *MinioClientAdmin) SetBucketPolicy(bucketName string, policy v1.BucketPolicy) error {
	var policyString string
	if policy == v1.BucketPolicyReadOnly {
		policyString = getReadonlyPolicy(bucketName)
	}

	if policy == v1.BucketPolicyPublic {
		policyString = getPublicPolicy(bucketName)
	}

	if policy == v1.BucketPolicyPrivate {
		return nil
	}

	if policyString == "" {
		return errors.New("invalid policy")
	}
	err := mca.s3Client.SetBucketPolicy(mca.context, bucketName, policyString)
	return err
}

// SetBucketQuota - sets a bucket quota in minio.
func (mca *MinioClientAdmin) SetBucketQuota(bucketName string, quota resource.Quantity) error {
	value, _ := quota.AsInt64()
	var _quota = &madmin.BucketQuota{Quota: uint64(value), Type: madmin.HardQuota}
	err := mca.adminClient.SetBucketQuota(mca.context, bucketName, _quota)
	return err
}

// EnableVersioning - enable a bucket versioning in minio.
func (mca *MinioClientAdmin) EnableVersioning(bucketName string) error {
	err := mca.s3Client.EnableVersioning(mca.context, bucketName)
	return err
}

func getReadonlyPolicy(bucket string) string {
	const tpl = `{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Effect": "Allow",
          "Action": [
              "s3:GetObject"
          ],
          "Principal": {
            "AWS": ["*"]
          },
          "Resource": [
              "arn:aws:s3:::${bucket}/*"
          ]
      }
  ]
}`

	return strings.ReplaceAll(tpl, "${bucket}", bucket)
}

func getPublicPolicy(bucket string) string {
	const tpl = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads"
      ],
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "*"
        ]
      },
      "Resource": [
        "arn:aws:s3:::${bucket}"
      ]
    },
    {
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:DeleteObject",
        "s3:GetObject",
        "s3:ListMultipartUploadParts",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "*"
        ]
      },
      "Resource": [
        "arn:aws:s3:::${bucket}/*"
      ]
    }
  ]
}`

	return strings.ReplaceAll(tpl, "${bucket}", bucket)
}
