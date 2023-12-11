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
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export type NodeJsRuntimeStreamingBlobPayloadOutputTypes = SdkStream<
  Readable | IncomingMessage
>
export type SdkStream<BaseStream> = BaseStream & SdkStreamMixin

export interface SdkStreamMixin {
  transformToByteArray: () => Promise<Uint8Array>
  transformToString: (encoding?: string) => Promise<string>
  transformToWebStream: () => ReadableStream
}
/**

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

  protected getExternalClient() {
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

  protected getInternalClient() {
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
   * Get S3 client of `@aws-sdk/client-s3`, by default it returns the internal access client.
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
   */
  public getS3Client(options: { external?: boolean } = { external: false }) {
    return options.external
      ? this.getExternalClient()
      : this.getInternalClient()
  }

  /**
   * Get bucket by short name
   * @param bucketShortName it is the short name of the bucket, e.g. `images`, NOT `{appid}-images`
   * @returns
   */
  bucket(bucketShortName: string): CloudStorageBucket {
    assert(bucketShortName, 'bucketShortName is required')
    const name = `${this.appid}-${bucketShortName}`
    return new CloudStorageBucket(this, name)
  }
}

export class CloudStorageBucket {
  readonly storage: CloudStorage
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
  ): Promise<NodeJsRuntimeStreamingBlobPayloadOutputTypes> {
    assert(filename, 'filename is required')
    const internal = this.storage.getS3Client()

    const args: GetObjectCommandInput = {
      Bucket: this.name,
      Key: filename,
      ...options,
    }
    const res = await internal.getObject(args)
    return res.Body as NodeJsRuntimeStreamingBlobPayloadOutputTypes
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
    const external = this.storage.getS3Client()

    const args: PutObjectCommandInput = {
      Bucket: this.name,
      Key: filename,
      Body: body,
      ...options,
    }
    const res = await external.putObject(args)
    return res
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
    const external = this.storage.getS3Client()

    const args: DeleteObjectCommandInput = {
      Bucket: this.name,
      Key: filename,
      ...options,
    }
    const res = await external.deleteObject(args)
    return res
  }

  /**
   * List files in bucket
   * @param prefix prefix is the key prefix of the object, it can contain subdirectories, e.g. `a/b/`
   * @param options
   * @returns
   * @see https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html
   */
  public async listFiles(
    prefix?: string,
    options?: Omit<ListObjectsCommandInput, 'Bucket' | 'Prefix'>
  ) {
    const internal = this.storage.getS3Client()

    const args: ListObjectsCommandInput = {
      Bucket: this.name,
      Prefix: prefix,
      ...options,
    }
    const res = await internal.listObjects(args)
    return res
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
    const external = this.storage.getS3Client({ external: true })

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
    const external = this.storage.getS3Client({ external: true })

    const args = new GetObjectCommand({
      Bucket: this.name,
      Key: filename,
      ...options,
    })

    const url = await getSignedUrl(external, args, { expiresIn: expiresIn })
    return url
  }
}
