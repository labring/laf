---
title: Uploading Files to Cloud Functions in Frontend
---

# {{ $frontmatter.title }}

## Uploading Files to Cloud Functions in Frontend

Using WeChat Mini Program as an example:

```js
// Select files in WeChat chat session
wx.chooseMessageFile({
  count: 1,
  type: 'all',
  success(res) {
    // Temporary file path of the selected file
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

## Parameters for Receiving Files in Cloud Functions

The file uploaded by the frontend can be found in `ctx.files` in the cloud function.

In Laf, the uploaded file can be found in `ctx.files`. The following is an example of printing the `ctx.files` after receiving a file in the cloud function:

```javascript
console.log(ctx.files)
// Output
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

- The file object is stored in `data`.

You can use `ctx.files[0].mimetype` to get the mimetype of the uploaded file.

## Creating a Cloud Function for Uploading Files

For example, create a cloud function named `uploadFile`, with the following code:

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
});
var fs = require("fs");
const bucketName = 'bucketName' // Without Laf application appid

// Concatenate the bucket name
function getInternalBucketName() {
  const appid = process.env.APP_ID;
  return `${appid}-${bucketName}`;
}

// Upload file
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

// Get file URL
async function getAppFileUrl(key) {
  const bucket = getInternalBucketName();
  const res = await getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  }));
  return res;
}

export default async function (ctx: FunctionContext) {
  // Get the uploaded file object
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

## Testing the Upload

1. Publish the cloud function and modify the URL of the cloud function in the frontend request.

2. Select a file in the frontend and upload it. The URL returned by the cloud storage will be printed in the console, indicating success.

## Delete the uploaded file

Create a new cloud function named `deleteFile`.

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
const bucketName = 'bucketName' // The bucket name without Laf application appid

// Concatenate the bucket name
function getInternalBucketName() {
  const appid = process.env.APP_ID;
  return `${appid}-${bucketName}`;
}

export default async function (ctx: FunctionContext) {
  const key = "" // Enter the filename of the uploaded file, which can be found on the Cloud Storage web page
  const bucket = getInternalBucketName()
  await s3Client.deleteObject({
    Bucket: bucket,
    Key: key
  })
}
```