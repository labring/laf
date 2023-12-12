---
title: 云存储操作云存储
---

# {{ $frontmatter.title }}

以下是用 S3 客户端来操作数据库，也有其他的操作方式，这里主要写 S3 客户端的常见的几个操作命令。更多命令可以参考：[`@aws-sdk/client-s3`官方文档](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html)

:::tip
S3 客户端依赖 `@aws-sdk/client-s3` 已默认安装，无需重新安装
:::

## 初始化 S3 客户端

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

## 上传文件

:::tip
如果上传文件已存在会自动覆盖之前的文件
:::

```typescript
await s3Client.putObject({
  Bucket: bucket,
  Key: path,
  Body: content,
  ContentType: contentType
});
```

- Bucket 文件桶的名字 格式是：`${appid}-${bucketName}`
- Key 上传文件在 S3 存储桶中的唯一标识符
  - 文件路径和名称：比如 `avatars/user1.png`
  - 文件夹名称 (以 / 结尾):比如 `avatars/` 用于创建文件夹
  - 相对路径：比如 `avatars/2021/01/`
  - 绝对路径：比如 `/avatars/2021/01/user1.png`
- Body 文件对象
  - Blob:原生文件对象，比如从 input 文件选择控件选择的文件
  - Buffer:Node.js 的二进制数据对象
  - String:文本文件内容
  - ReadableStream:文件流，用于上传大文件
- ContentType(MIME 类型)
  - image/png:PNG 图片
  - image/jpeg:JPEG 图片
  - application/json:JSON 文件
  - text/plain:TXT 文本文件
  - application/octet-stream:二进制流文件
  - 等等

:::tip
当前应用的 appid 可用 `cloud.appid` 或 `process.env.APPID` 获取
:::

## 删除云存储对象

可删除云存储文件或者文件夹

```typescript
await s3Client.deleteObject({
  Bucket: bucket,
  Key: path
})
```

- Bucket 文件桶的名字 格式是：`${appid}-${bucketName}`
- Key 文件在 S3 存储桶中的唯一标识符
  - 文件路径和名称：比如 `avatars/user1.png`
  - 文件夹名称 (以 / 结尾):比如 `avatars/` 用于删除文件夹
  - 相对路径：比如 `avatars/2021/01/`
  - 绝对路径：比如 `/avatars/2021/01/user1.png`

## 下载云存储对象

可删除云存储文件或者文件夹

```typescript
await s3Client.getObject({
  Bucket: bucket,
  Key: path
})
```

- Bucket 文件桶的名字 格式是：`${appid}-${bucketName}`
- Key 文件在 S3 存储桶中的唯一标识符
  - 文件路径和名称：比如 `avatars/user1.png`
  - 文件夹名称 (以 / 结尾):比如 `avatars/` 用于删除文件夹
  - 相对路径：比如 `avatars/2021/01/`
  - 绝对路径：比如 `/avatars/2021/01/user1.png`

以下为获取`gen.py`的代码

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

## 生成文件预签名链接

用来生成没有读权限的文件的临时访问链接

```typescript
import { S3 , GetObjectCommand } from "@aws-sdk/client-s3"; // 加入 GetObjectCommand 的引入
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // 云函数顶部引入

const url = await getSignedUrl(s3Client, new GetObjectCommand({
  Bucket: bucket,
  Key: path,
}), 
{ 
  expiresIn: expiresSeconds
});
```

- Bucket 文件桶的名字 格式是：`${appid}-${bucketName}`
- Key 分享文件在 S3 存储桶中的唯一标识符
  - 文件路径和名称：比如 `avatars/user1.png`
  - 绝对路径：比如 `/avatars/2021/01/user1.png`
- expiresIn 访问过期时间，超过时间将无法访问

## 列出云存储 bucket 中的文件对象

```typescript
await s3Client.listObjectsV2({
  Bucket: bucket,
  MaxKeys: size,
  Prefix: prefix,
  StartAfter: startAfter
})
```

- Bucket 文件桶的名字 格式是：`${appid}-${bucketName}`
- Delimiter: 可选。一个分隔符，listObjectsV2 将不会返回 Delimiter 之后的对象键。用于跳过文件夹中的对象。
- EncodingType: 可选。指定响应应返回的对象键的编码方法。可以是 url。
- FetchOwner: 可选。如果为 true，响应将包含 Owner 信息。默认 false。
- MaxKeys: 可选。要返回的最大对象数量。默认为 1000。如果有更多结果，响应将被截断。
- NextContinuationToken: 可选。用于获取列表操作结果的下一页。从前一个 listObjectsV2 调用中获取。
- Prefix: 可选。用于过滤对象键的前缀。只返回与此前缀匹配的键。一般用来获取文件夹中的文件列表。
- StartAfter: 可选。列出的对象键应开始于的起点。用于实现更高效的分页。

例如，要列出 bucket 中前缀为 "photos/" 的所有对象，每页 100 个：

```typescript
let response = await s3Client.listObjectsV2({
  Bucket: 'bucket-name',
  Prefix: 'photos/',
  MaxKeys: 100 
});
```

例如，要实现存储桶文件对象的分页查询

假设您的存储桶有 100,000 个对象，MaxKeys 为 1000

分页方法 1:

```typescript
const pageSize = 2
let response = await s3Client.listObjectsV2({
  Bucket: 'bucket-name',
  MaxKeys: pageSize,
  Delimiter: '/' // 只显示根级别对象并跳过所有子文件夹，您可以将 Delimiter 设置为 /
});
console.log(response)
// IsTruncated 为 true 则代表还有下一页
if (response.IsTruncated) {
  // 获取下一页需要使用最后一个对象的 Key 作为 StartAfter:
  const array = response.Contents
  const lastObject = array[array.length - 1]
  const lastKey = lastObject.Key
  let response2 = await s3Client.listObjectsV2({
    Bucket: 'bucket-name',
    MaxKeys: pageSize,
    StartAfter: lastKey
  });
  console.log(response2)
}
```

分页方法 2:

```typescript
const pageSize = 2
let response = await s3Client.listObjectsV2({
  Bucket: 'bucket-name',
  MaxKeys: pageSize
});
console.log(response)
// IsTruncated 为 true 则代表还有下一页
if (response.IsTruncated) {
  // 获取下一页将当前的 NextContinuationToken 传给下一次查询的 ContinuationToken:
  const nextToken = response.NextContinuationToken;
  let response2 = await s3Client.listObjectsV2({
    Bucket: 'bucket-name',
    MaxKeys: pageSize,
    ContinuationToken: nextToken,
  });
  console.log(response2)
}
```

## 前端通过云函数上传文件存云存储

### 前端上传文件到云函数

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

### 云函数接收文件的参数

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
var fs = require("fs");
var data = await fs.readFileSync(ctx.files[0].path);
```

- data 里面就是文件对象

通过 `ctx.files[0].mimetype` 可以获取上传文件的 mimetype

### 新建云函数上传文件云函数

如：`uploadFile`,代码如下：

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
const bucketName = 'bucketName' // 不带 Laf 应用 appid

//拼接文件桶名字
function getInternalBucketName() {
  const appid = process.env.APP_ID;
  return `${appid}-${bucketName}`;
}

//上传文件
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

//获取文件 url
async function getAppFileUrl(key) {
  const bucket = getInternalBucketName();
  const res = await getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  }));
  return res;
}

export default async function (ctx: FunctionContext) {
  //获取上传文件的对象
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

### 测试上传

1.发布云函数，并将该云函数的 URL 修改至前端云函数请求地址

2.前端选择文件并上传，控制台打印云存储返回的 Url，即成功

### 删除刚刚上传的文件

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
  const appid = process.env.APPID;
  return `${appid}-${bucketName}`;
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

- Key 文件存储路径
  - 如果传入的路径不存在，会自动创建
  - 如果传入的文件存在，会自动覆盖源文件
- ContentType 上传文件的 `mimetype` 类型
- Body 文件对象
