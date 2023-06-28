---
title: Cloud Storage Operations with S3 Client
---

# {{ $frontmatter.title }}

Here are several common operations commands for the S3 client to manipulate the database. For more commands, please refer to the [official documentation of `@aws-sdk/client-s3`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html).

:::tip
The S3 client depends on `@aws-sdk/client-s3` which is already installed by default and does not require reinstallation.
:::

## Initialize the S3 Client

```typescript
import { S3 } from "@aws-sdk/client-s3";
const s3Client = new S3({
  endpoint: process.env.OSS_EXTERNAL_ENDPOINT,
  region: process.env.OSS_REGION,
  credentials: {
    accessKeyId: process.env.OSS_ACCESS_KEY,
    secretAccessKey: process.env.OSS_ACCESS_SECRET
  },
  forcePathStyle: true,
})
```

## Upload Files

:::tip
If the uploaded file already exists, it will automatically overwrite the previous file.
:::

```typescript
await s3Client.putObject({
  Bucket: bucket,
  Key: path,
  Body: content,
  ContentType: contentType
});
```

- Bucket: The name of the file bucket, formatted as `${appid}-${bucketName}`.
- Key: The unique identifier of the uploaded file in the S3 storage bucket.
  - File path and name: For example, `avatars/user1.png`.
  - Folder name (ending with /): For example, `avatars/` used to create a folder.
  - Relative path: For example, `avatars/2021/01/`.
  - Absolute path: For example, `/avatars/2021/01/user1.png`.
- Body: The file object.
  - Blob: The native file object, such as the file selected from the input file control.
  - Buffer: The binary data object of Node.js.
  - String: The content of a text file.
  - ReadableStream: The file stream used to upload large files.
- ContentType (MIME type)
  - image/png: PNG image
  - image/jpeg: JPEG image
  - application/json: JSON file
  - text/plain: TXT text file
  - application/octet-stream: Binary stream file
  - and so on

## Delete Cloud Storage Objects

You can delete cloud storage files or folders.

```typescript
await s3Client.deleteObject({
  Bucket: bucket,
  Key: path
})
```

- Bucket: The name of the file bucket, formatted as `${appid}-${bucketName}`.
- Key: The unique identifier of the file in the S3 storage bucket.
  - File path and name: For example, `avatars/user1.png`.
  - Folder name (ending with /): For example, `avatars/` used to delete a folder.
  - Relative path: For example, `avatars/2021/01/`.
  - Absolute path: For example, `/avatars/2021/01/user1.png`.

## Download Cloud Storage Objects

You can download cloud storage files or folders.

```typescript
await s3Client.getObject({
  Bucket: bucket,
  Key: path
})
```

- Bucket: The name of the file bucket, formatted as `${appid}-${bucketName}`.
- Key: The unique identifier of the file in the S3 storage bucket.
  - File path and name: For example, `avatars/user1.png`.
  - Folder name (ending with /): For example, `avatars/` used to delete a folder.
  - Relative path: For example, `avatars/2021/01/`.
  - Absolute path: For example, `/avatars/2021/01/user1.png`.

The following is the code to retrieve `gen.py`:

```typescript
import { S3 } from "@aws-sdk/client-s3"

export default async function (ctx: FunctionContext) {
  const s3 = new S3({
    endpoint: process.env.OSS_EXTERNAL_ENDPOINT,
    region: process.env.OSS_REGION,
    credentials: {
      accessKeyId: process.env.OSS_ACCESS_KEY,
      secretAccessKey: process.env.OSS_ACCESS_SECRET
    },
    forcePathStyle: true,
  })

  const res = await s3.getObject({
    Bucket: 'c5nodm-test',
    Key: 'gen.py',
  })

  const data = await res.Body.transformToString()
  console.log(data)
}
```

## Generating Pre-signed Links for Files

Used to generate temporary access links for files without read permission.

```typescript
import { S3, GetObjectCommand } from "@aws-sdk/client-s3"; // Import the GetObjectCommand
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // Import at the top of the cloud function

const url = await getSignedUrl(s3Client, new GetObjectCommand({
  Bucket: bucket,
  Key: path,
}),
{
  expiresIn: expiresSeconds
});
```

- **Bucket**: The name of the file bucket in the format `${appid}-${bucketName}`.
- **Key**: The unique identifier of the shared file in the S3 storage bucket.
  - File path and name, e.g., `avatars/user1.png`.
  - Absolute path, e.g., `/avatars/2021/01/user1.png`.
- **expiresIn**: Access expiration time. After this time, the link will no longer be accessible.

## Listing Objects in a Cloud Storage Bucket

```typescript
await s3Client.listObjectsV2({
  Bucket: bucket,
  MaxKeys: size,
  Prefix: prefix,
  StartAfter: startAfter
})
```

- **Bucket**: The name of the file bucket in the format `${appid}-${bucketName}`.
- **Delimiter**: Optional. A delimiter that indicates that listObjectsV2 should not return objects after the delimiter. Used to skip objects within folders.
- **EncodingType**: Optional. Specifies the encoding method for object keys returned in the response. Can be "url".
- **FetchOwner**: Optional. If true, the response will include owner information. Default is false.
- **MaxKeys**: Optional. The maximum number of objects to return. Default is 1000. If there are more results, the response will be truncated.
- **NextContinuationToken**: Optional. Used to get the next page of results for a list operation. Obtained from the previous listObjectsV2 call.
- **Prefix**: Optional. Filters the object keys based on prefix. Only returns keys that match this prefix. Typically used for getting a list of files within a folder.
- **StartAfter**: Optional. The starting point for listing objects. Used for more efficient pagination.

For example, to list all objects in a bucket with the prefix "photos/", 100 objects per page:

```typescript
let response = await s3Client.listObjectsV2({
  Bucket: 'bucket-name',
  Prefix: 'photos/',
  MaxKeys: 100 
});
```

To implement paginated queries for bucket file objects:

Assume there are 100,000 objects in your bucket and MaxKeys is set to 1000.

Pagination Method 1:

```typescript
const pageSize = 2;
let response = await s3Client.listObjectsV2({
  Bucket: 'bucket-name',
  MaxKeys: pageSize,
  Delimiter: '/' // Show only root-level objects and skip all sub-folders. You can set Delimiter to /
});
console.log(response);
// If IsTruncated is true, there are more pages
if (response.IsTruncated) {
  // To get the next page, use the Key of the last object as StartAfter:
  const array = response.Contents;
  const lastObject = array[array.length - 1];
  const lastKey = lastObject.Key;
  let response2 = await s3Client.listObjectsV2({
    Bucket: 'bucket-name',
    MaxKeys: pageSize,
    StartAfter: lastKey
  });
  console.log(response2);
}
```

Pagination Method 2:

```typescript
const pageSize = 2;
let response = await s3Client.listObjectsV2({
  Bucket: 'bucket-name',
  MaxKeys: pageSize
});
console.log(response);
// If IsTruncated is true, there are more pages
if (response.IsTruncated) {
  // Pass the current NextContinuationToken to the ContinuationToken in the next query:
  const nextToken = response.NextContinuationToken;
  let response2 = await s3Client.listObjectsV2({
    Bucket: 'bucket-name',
    MaxKeys: pageSize,
    ContinuationToken: nextToken,
  });
  console.log(response2);
}
```

## Uploading Files to Cloud Storage from Frontend via Cloud Functions

### Uploading Files to Cloud Functions from Frontend

Using WeChat Mini Program as an example:

```js
// Select file from WeChat chat session
wx.chooseMessageFile({
  count: 1,
  type: 'all',
  success(res) {
    // Temporary path of the selected file
    const tempFilePaths = res.tempFiles[0].path
    wx.uploadFile({
      url: 'Cloud Function URL',
      filePath: tempFilePaths,
      name: 'file',
      success(res) {
        console.log(res.data)
      }
    })
  }
})
```

### Parameters for File Upload in Cloud Functions

The file uploaded by the frontend can be found in `ctx.files` in the cloud function.

In Laf, the uploaded file can be found in `ctx.files`. Here is an example of printing the content of `ctx.files` after receiving the file in the cloud function:

```javascript
console.log(ctx.files)
// Output:
// [
//   {
//     fieldname: 'file',
//     originalname: 'WWcBsfDKw45X965dd934f04a7b0a405467b91800d7ce.jpg',
//     encoding: '7bit',
//     mimetype: 'image/jpeg',
//     destination: '/tmp',
//     filename: 'e6feb0a3-85d7-4fe3-b9ae-78701146acd8.jpg',
//     path: '/tmp/e6feb0a3-85d7-4fe3-b9ae-78701146acd8.jpg',
//     size: 219043
//   }
// ]
```

You can use `ctx.files[0].path` to get the temporary path of the uploaded file.

You can also use the built-in `fs` library in Node.js to get the file object:

```javascript
var fs = require("fs");
var data = await fs.readFileSync(ctx.files[0].path);
```

- The `data` variable contains the file object.

You can use `ctx.files[0].mimetype` to get the mimetype of the uploaded file.

### Creating a Cloud Function for File Upload

For example, let's create a cloud function called `uploadFile` with the following code:

```typescript
import cloud from "@lafjs/cloud";
import { GetObjectCommand, S3 } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const s3Client = new S3({
  endpoint: process.env.OSS_EXTERNAL_ENDPOINT,
  region: process.env.OSS_REGION,
  credentials: {
    accessKeyId: process.env.OSS_ACCESS_KEY,
    secretAccessKey: process.env.OSS_ACCESS_SECRET
  },
  forcePathStyle: true,
})
var fs = require("fs");
const bucketName = 'bucketName' // Replace with the actual bucket name without Laf appid

// Concatenate the bucket name
function getInternalBucketName() {
  const appid = process.env.APP_ID;
  return `${appid}-${bucketName}`;
}

// Upload the file
async function uploadAppFile(key, body, contentType) {
  const bucket = getInternalBucketName();
  const res = await s3Client
    .putObject({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      Body: body,
    })
  return res;
}

// Get the file URL
async function getAppFileUrl(key) {
  const bucket = getInternalBucketName();
  const res = await getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  }));
  return res;
}

export default async function (ctx: FunctionContext) {
  // Get the file object
  var data = await fs.readFileSync(ctx.files[0].path);
  const res = await uploadAppFile(
    ctx.files[0].filename,
    data,
    ctx.files[0].mimetype
  );
  const fileUrl = await getAppFileUrl(ctx.files[0].filename);
  return fileUrl;
};
```

### Testing the File Upload

1. Publish the cloud function and modify the URL of the cloud function request in the frontend.

2. Select a file in the frontend and upload it. The URL returned by the cloud storage will be printed in the console, indicating a successful upload.

### Delete the uploaded file

Create a new cloud function called `deleteFile`.

```typescript
import cloud from "@lafjs/cloud";
import { S3 } from "@aws-sdk/client-s3";
const s3Client = new S3({
  endpoint: process.env.OSS_EXTERNAL_ENDPOINT,
  region: process.env.OSS_REGION,
  credentials: {
    accessKeyId: process.env.OSS_ACCESS_KEY,
    secretAccessKey: process.env.OSS_ACCESS_SECRET
  },
  forcePathStyle: true,
})
const bucketName = 'bucketName' // without Laf appid

// Concatenate the bucket name
function getInternalBucketName() {
  const appid = process.env.APP_ID;
  return `${appid}-${bucketName}`;
}

export default async function (ctx: FunctionContext) {
  const key = "" // Fill in the file name that was just uploaded, which can be found in the Cloud Storage web page
  const bucket = getInternalBucketName()
  await s3Client.deleteObject({
    Bucket: bucket,
    Key: key
  })
}
```

- Key: File storage path
  - If the path does not exist, it will be automatically created.
  - If the file already exists, it will be automatically overwritten.
- ContentType: The mimetype type of the uploaded file
- Body: The file object.