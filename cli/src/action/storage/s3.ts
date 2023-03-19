import { S3Client } from '@aws-sdk/client-s3'

export function getS3ClientV3(credentials: any): S3Client {
  return new S3Client({
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.accessKeySecret,
      sessionToken: credentials.sessionToken,
    },
    endpoint: credentials.endpoint,
    forcePathStyle: true,
    region: 'us-east-1',
  })
}
