import * as assert from 'node:assert'
import { Readable } from 'node:stream'
import { IncomingMessage } from 'node:http'
import {
  S3,
  GetObjectCommandInput,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  ListObjectsCommandInput,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommandOutput,
  DeleteObjectCommandOutput,
  ListObjectsCommandOutput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { IS_SEALAF } from './util'

export type NodeJsRuntimeStreamingBlobPayloadOutputTypes = SdkStream<
  Readable | IncomingMessage
>
export type SdkStream<BaseStream> = BaseStream & SdkStreamMixin

export interface SdkStreamMixin {
  transformToByteArray: () => Promise<Uint8Array>
  transformToString: (encoding?: string) => Promise<string>
  transformToWebStream: () => ReadableStream
}

export interface ResponseMetadata {
  /**
   * The status code of the last HTTP response received for this operation.
   */
  httpStatusCode?: number
  /**
   * A unique identifier for the last request sent for this operation. Often
   * requested by AWS service teams to aid in debugging.
   */
  requestId?: string
  /**
   * A secondary identifier for the last request sent. Used for debugging.
   */
  extendedRequestId?: string
  /**
   * A tertiary identifier for the last request sent. Used for debugging.
   */
  cfId?: string
  /**
   * The number of times this operation was attempted.
   */
  attempts?: number
  /**
   * The total amount of time (in milliseconds) that was spent waiting between
   * retry attempts.
   */
  totalRetryDelay?: number
}

export interface ExtendGetObjectCommandOutput extends GetObjectCommandOutput {
  Body: NodeJsRuntimeStreamingBlobPayloadOutputTypes
  $metadata: ResponseMetadata
}

export interface ExtendPutObjectCommandOutput extends PutObjectCommandOutput {
  $metadata: ResponseMetadata
}

export interface ExtendDeleteObjectCommandOutput
  extends DeleteObjectCommandOutput {
  $metadata: ResponseMetadata
}

export interface ExtendListObjectsCommandOutput
  extends ListObjectsCommandOutput {
  $metadata: ResponseMetadata
}

/**
 * `ICloudStorage` is an interface for cloud storage services.
 */
export class CloudStorage {
  protected _externalS3Client: S3
  protected _internalS3Client: S3

  protected get appid() {
    assert(process.env.APPID, 'APPID is required')
    return process.env.APPID
  }

  public get externalEndpoint() {
    assert(
      process.env.OSS_EXTERNAL_ENDPOINT,
      'OSS_EXTERNAL_ENDPOINT is required'
    )
    return process.env.OSS_EXTERNAL_ENDPOINT
  }

  public get internalEndpoint() {
    assert(
      process.env.OSS_INTERNAL_ENDPOINT,
      'OSS_INTERNAL_ENDPOINT is required'
    )
    return process.env.OSS_INTERNAL_ENDPOINT
  }

  /**
   * Get external S3 client of `@aws-sdk/client-s3`.
   * You can use this client to access the bucket through the external endpoint.
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
   * @returns
   */
  public getExternalS3Client() {
    if (!this._externalS3Client) {
      assert(
        process.env.OSS_EXTERNAL_ENDPOINT,
        'OSS_EXTERNAL_ENDPOINT is required'
      )
      assert(process.env.OSS_REGION, 'OSS_REGION is required')
      assert(process.env.OSS_ACCESS_KEY, 'OSS_ACCESS_KEY is required')
      assert(process.env.OSS_ACCESS_SECRET, 'OSS_ACCESS_SECRET is required')

      this._externalS3Client = new S3({
        endpoint: process.env.OSS_EXTERNAL_ENDPOINT,
        region: process.env.OSS_REGION,
        credentials: {
          accessKeyId: process.env.OSS_ACCESS_KEY,
          secretAccessKey: process.env.OSS_ACCESS_SECRET,
        },
        forcePathStyle: true,
      })
    }

    return this._externalS3Client
  }

  /**
   * Get internal S3 client of `@aws-sdk/client-s3`.
   * You can use this client to access the bucket through the internal endpoint.
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
   */
  public getInternalS3Client() {
    if (!this._internalS3Client) {
      assert(
        process.env.OSS_INTERNAL_ENDPOINT,
        'OSS_INTERNAL_ENDPOINT is required'
      )
      assert(process.env.OSS_REGION, 'OSS_REGION is required')
      assert(process.env.OSS_ACCESS_KEY, 'OSS_ACCESS_KEY is required')
      assert(process.env.OSS_ACCESS_SECRET, 'OSS_ACCESS_SECRET is required')

      this._internalS3Client = new S3({
        endpoint: process.env.OSS_INTERNAL_ENDPOINT,
        region: process.env.OSS_REGION,
        credentials: {
          accessKeyId: process.env.OSS_ACCESS_KEY,
          secretAccessKey: process.env.OSS_ACCESS_SECRET,
        },
        forcePathStyle: true,
      })
    }

    return this._internalS3Client
  }

  /**
   * Get bucket by bucket name
   * @returns
   */
  bucket(bucketName: string): CloudStorageBucket {
    assert(bucketName, 'bucketName is required')
    if (IS_SEALAF || bucketName.startsWith(`${this.appid}-`)) {
      return new CloudStorageBucket(this, bucketName)
    }
    const name = `${this.appid}-${bucketName}`
    return new CloudStorageBucket(this, name)
  }
}

export class CloudStorageBucket {
  protected readonly storage: CloudStorage
  readonly name: string

  constructor(storage: CloudStorage, name: string) {
    assert(storage, 'storage is required')
    assert(name, 'name is required')

    this.storage = storage
    this.name = name
  }

  /**
   * Read file from bucket
   * @param filename filename is the key of the object, it can contain subdirectories, e.g. `a/b/c.txt`
   * @param options
   * @returns
   * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html
   */
  public async readFile(
    filename: string,
    options?: Omit<GetObjectCommandInput, 'Bucket' | 'Key'>
  ) {
    assert(filename, 'filename is required')
    const internal = this.storage.getInternalS3Client()

    const args: GetObjectCommandInput = {
      Bucket: this.name,
      Key: filename,
      ...options,
    }

    const res = await internal.getObject(args)
    return res as ExtendGetObjectCommandOutput
  }

  /**
   * Write file to bucket
   * @param filename filename is the key of the object, it can contain subdirectories, e.g. `a/b/c.txt`
   * @param body body is the content of the object, it can be a string, a Buffer, a Readable stream, or a Blob
   * @param options
   * @returns
   * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObject.html
   */
  public async writeFile(
    filename: string,
    body: string | Blob | Buffer | Uint8Array | Readable,
    options?: Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body'>
  ) {
    assert(filename, 'key is required')
    assert(body, 'body is required')
    const external = this.storage.getInternalS3Client()

    const args: PutObjectCommandInput = {
      Bucket: this.name,
      Key: filename,
      Body: body,
      ...options,
    }
    const res = await external.putObject(args)
    return res as ExtendPutObjectCommandOutput
  }

  /**
   * Delete file from bucket
   * @param filename filename is the key of the object, it can contain subdirectories, e.g. `a/b/c.txt`
   * @param options
   * @returns
   * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteObject.html
   */
  public async deleteFile(
    filename: string,
    options?: Omit<DeleteObjectCommandInput, 'Bucket' | 'Key'>
  ) {
    assert(filename, 'filename is required')
    const external = this.storage.getInternalS3Client()

    const args: DeleteObjectCommandInput = {
      Bucket: this.name,
      Key: filename,
      ...options,
    }
    const res = await external.deleteObject(args)
    return res as ExtendDeleteObjectCommandOutput
  }

  /**
   * List files in bucket
   * @param prefix prefix is the key prefix of the object, it can contain subdirectories, e.g. `a/b/`
   * @param options
   * @returns
   * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html
   */
  public async listFiles(options?: Omit<ListObjectsCommandInput, 'Bucket'>) {
    const internal = this.storage.getInternalS3Client()

    const args: ListObjectsCommandInput = {
      Bucket: this.name,
      ...options,
    }
    const res = await internal.listObjects(args)
    return res as ExtendListObjectsCommandOutput
  }

  /**
   * Get external url of the file.
   * You can ONLY use this url to access file from `readonly` bucket or `public` bucket.
   * Use `getDownloadUrl()` to get a signed url for `private` bucket.
   * @param filename filename is the key of the object, it can contain subdirectories, e.g. `a/b/c.txt`
   * @returns
   */
  public externalUrl(filename: string) {
    assert(filename, 'filename is required')
    return `${this.storage.externalEndpoint}/${this.name}/${filename}`
  }

  /**
   * Get internal url of the file.
   * You can ONLY use this url to access file from `readonly` bucket or `public` bucket.
   * Use `getDownloadUrl()` to get a signed url for `private` bucket.
   * @param filename filename is the key of the object, it can contain subdirectories, e.g. `a/b/c.txt`
   * @returns
   */
  public internalUrl(filename: string) {
    assert(filename, 'filename is required')
    return `${this.storage.internalEndpoint}/${this.name}/${filename}`
  }

  /**
   * Get upload url, you can use this url to upload file directly to bucket
   * @param filename filename is the key of the object, it can contain subdirectories, e.g. `a/b/c.txt`
   * @param expiresIn expiresIn is the seconds of the signed url, default is `3600` seconds which is 1 hour
   * @param options
   * @returns
   */
  public async getUploadUrl(
    filename: string,
    expiresIn = 3600,
    options?: Omit<PutObjectCommandInput, 'Bucket' | 'Key'>
  ) {
    assert(filename, 'filename is required')
    const external = this.storage.getExternalS3Client()

    const args = new PutObjectCommand({
      Bucket: this.name,
      Key: filename,
      ...options,
    })

    const url = await getSignedUrl(external, args, { expiresIn: expiresIn })
    return url
  }

  /**
   * Get download url, you can use this url to download file directly from bucket
   * @param filename filename is the key of the object, it can contain subdirectories, e.g. `a/b/c.txt`
   * @param expiresIn expiresIn is the seconds of the signed url, default is `3600` seconds which is 1 hour
   * @param options
   * @returns
   */
  public async getDownloadUrl(
    filename: string,
    expiresIn = 3600,
    options?: Omit<GetObjectCommandInput, 'Bucket' | 'Key'>
  ) {
    assert(filename, 'filename is required')
    const external = this.storage.getExternalS3Client()

    const args = new GetObjectCommand({
      Bucket: this.name,
      Key: filename,
      ...options,
    })

    const url = await getSignedUrl(external, args, { expiresIn: expiresIn })
    return url
  }
}
