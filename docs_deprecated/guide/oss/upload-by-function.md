---
title: 前端通过云函数上传文件
---

# {{ $frontmatter.title }}

## 前端上传文件到云函数

以微信小程序为例

```js
// 微信聊天回话选择文件
wx.chooseMessageFile({
  count: 1,
  type: 'all',
  success(res) {
    // 选择的文件临时路径
    const tempFilePaths = res.tempFiles[0].path
    wx.uploadFile({
      url: '云函数地址',
      filePath: tempFilePaths,
      name: 'file',
      success(res) {
        console.log(res.data)
      }
    })
  }
})
```

## 云函数接收文件的参数

前端上传的文件在云函数的`ctx.files` 里可以找到

在 Laf 中 上传的文件可以在 `ctx.files` 里找到，以下是云函数接收到文件后`ctx.files`的打印结果范例。

```javascript
console.log(ctx.files)
// 输出结果
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

可以通过 `ctx.files[0].path` 来获取上传文件的临时路径

还可以使用 nodejs 自带的 `fs`库 来获取文件对象

```javascript
import { readFile } from 'fs/promises'
const data = await readFile(ctx.files[0].path)
```

- data 里面就是文件对象

通过 `ctx.files[0].mimetype` 可以获取上传文件的 mimetype

## 新建云函数上传文件云函数

如：`uploadFile`,代码如下：

```typescript
import cloud from "@lafjs/cloud"
import { GetObjectCommand, S3 } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { readFile } from 'fs/promises'

const s3Client = new S3({
  endpoint: process.env.OSS_EXTERNAL_ENDPOINT,
  region: process.env.OSS_REGION,
  credentials: {
    accessKeyId: process.env.OSS_ACCESS_KEY,
    secretAccessKey: process.env.OSS_ACCESS_SECRET
  },
  forcePathStyle: true,
})

const bucketName = 'bucketName' // 不带 Laf 应用 appid

//拼接文件桶名字
function getInternalBucketName() {
  const appid = process.env.APP_ID
  return `${appid}-${bucketName}`
}

//上传文件
async function uploadAppFile(key, body, contentType) {
  const bucket = getInternalBucketName()
  const res = await s3Client
    .putObject({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      Body: body,
    })

  return res
}

//获取文件 url
async function getAppFileUrl(key) {
  const bucket = getInternalBucketName();
  const res = await getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  }))

  return res
}

export default async function (ctx: FunctionContext) {
  //获取上传文件的对象
  const data = await readFile(ctx.files[0].path);
  const res = await uploadAppFile(
    ctx.files[0].filename,
    data,
    ctx.files[0].mimetype
  );
  const fileUrl = await getAppFileUrl(ctx.files[0].filename);
  return fileUrl
}
```

## 测试上传

1.发布云函数，并将该云函数的 URL 修改至前端云函数请求地址

2.前端选择文件并上传，控制台打印云存储返回的 Url，即成功

## 删除刚刚上传的文件

重新新建一个云函数，如命名为 `deleteFile`

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
const bucketName = 'bucketName' // 不带 Laf 应用 appid

//拼接文件桶名字
function getInternalBucketName() {
  const appid = process.env.APPID
  return `${appid}-${bucketName}`
}

export default async function (ctx: FunctionContext) {
  const key = "" // 这里填刚刚上传的文件名，可在云存储 Web 标签页中查看
  const bucket = getInternalBucketName()
  await s3Client.deleteObject({
    Bucket: bucket,
    Key: key
  })
}
```
