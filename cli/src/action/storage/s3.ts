import * as AWS from 'aws-sdk'
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

export function getS3Client(credentials: any) {
  return new AWS.S3({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.accessKeySecret,
    sessionToken: credentials.sessionToken,
    endpoint: credentials.endpoint,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region: 'us-east-1',
  })
}
