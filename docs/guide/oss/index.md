---
title: 云存储(OSS)使用介绍
---

# {{ $frontmatter.title }}

`laf` 云存储是基于 [MinIO](https://min.io/) 提供的对象存储服务，laf 提供了具完全 MinIO 的对象存储服务，开发者也可参考 [MinIO](https://min.io/) 的文档来使用 laf 云存储。

开发者可自由选择以下 SDK 来操作 laf oss：

- 使用 aws-sdk for javascript 操作云存储示例： https://docs.min.io/docs/how-to-use-aws-sdk-for-javascript-with-minio-server.html
- 使用 minio sdk for javascript 操作云存储示例： https://docs.min.io/docs/javascript-client-quickstart-guide.html

同时， [MinIO 文档](https://docs.min.io/docs/javascript-client-quickstart-guide.html) 还提供了 `Java` `Python` `Golang` 等多种语言的 SDK 。

在云函数里访问 Laf 云存储

Laf 的云存储是标准的 s3 接口，同时 阿里云 腾讯云等的对象存储 都是 s3 api 兼容的，我们可以通过 s3 api 来控制文件的增删改查

我们可以使用 `aws-sdk` 库，实现文件实现增删改查，当然你也可以所以其他库

操作之前需要在 依赖管理 里添加 `aws-sdk` 库

1. 获取 s3 客户端

我们可以通过如下代码来导入 aws-sdk 库

```javascript
const AWS = require("aws-sdk");
```

你可以通过 `AWS.S3` 来创建一个 s3 客户端

```javascript
new AWS.S3({
  accessKeyId: cloud.env.OSS_ACCESS_KEY,
  secretAccessKey: cloud.env.OSS_ACCESS_SECRET,
  endpoint: "https://oss.laf.run",
  s3ForcePathStyle: true,
  signatureVersion: "v4",
  region: cloud.env.OSS_REGION,
});
```

注意： endpoint 是云存储的地址，一定要和 云存储页面里的文件管理页面 上方 `OSS EndPoint` 里的值一样

2. 上传文件

```javascript
const s3 = getS3Client(); // 获取s3客户端 可参考上面的

const res = s3
  .putObject({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    Body: body,
  })
  .promise();
```

- Bucket 文件桶的名字 格式是：`${appid}-${bucketName}`
- Key 文件存储路径
  - 如果传入的路径不存在，会自动创建
  - 如果传入的文件存在，会自动覆盖源文件
- ContentType 上传文件的 `mimetype`
- Body 文件对象

3. 获取上传文件访问 Url

```javascript
const s3 = getS3Client(); // 获取s3客户端 可参考上面的

const res = s3.getSignedUrl("getObject", {
  Bucket: bucket,
  Key: key,
});
```

- Bucket 文件桶的名字 格式是：`${appid}-${bucketName}`
- Key 要获取 url 的文件的路径

会直接返回要获取路径的文件的 url

4. 删除文件

```javascript
const s3 = getS3Client(); // 获取s3客户端 可参考上面的

const res = await s3
  .deleteObject({
    Bucket: bucket,
    Key: key,
  })
  .promise();
```

- Bucket 文件桶的名字 格式是：`${appid}-${bucketName}`
- Key 要删除的文件的路径

一些小小的案例

1. 把上传的文件存到云存储里

在 Laf 中 上传的文件可以在 `ctx.files` 里找到

我们可以通过 `ctx.files[0].path` 来获取上传的第一个文件的 临时路径

我们可以使用 nodejs 自带的 `fs`库 来获取文件对象

```javascript
var fs = require("fs");
var data = await fs.readFileSync(ctx.files[0].path);
```

- data 里面就是文件对象

通过 `ctx.files[0].mimetype` 可以获取上传文件的 mimetype

组合一下：

```javascript
import cloud from "@lafjs/cloud";
const AWS = require("aws-sdk");
var fs = require("fs");

//获取s3客户端
function getS3Client() {
  return new AWS.S3({
    accessKeyId: cloud.env.OSS_ACCESS_KEY,
    secretAccessKey: cloud.env.OSS_ACCESS_SECRET,
    endpoint: "https://oss.laf.run",
    s3ForcePathStyle: true,
    signatureVersion: "v4",
    region: cloud.env.OSS_REGION,
  });
}

//拼接文件桶名字
function getInternalBucketName(bucketName) {
  const appid = cloud.env.APP_ID;
  return `${appid}-${bucketName}`;
}

//上传文件
function uploadAppFile(bucketName, key, body, contentType) {
  const s3 = getS3Client();
  const bucket = getInternalBucketName(bucketName);

  const res = s3
    .putObject({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      Body: body,
    })
    .promise();
  return res;
}

//获取文件url
export function getAppFileUrl(bucketName, key) {
  const s3 = getS3Client();
  const bucket = getInternalBucketName(bucketName);

  const res = s3.getSignedUrl("getObject", { Bucket: bucket, Key: key });
  return res;
}

exports.main = async function (ctx: FunctionContext) {
  //获取上传文件的对象
  var data = await fs.readFileSync(ctx.files[0].path);

  const res = await uploadAppFile(
    "test",
    "image/test.jpg",
    data,
    ctx.files[0].mimetype
  );
  const fileUrl = await getAppFileUrl("test", "image/test.jpg");

  return fileUrl;
};
```

2. 删除刚才上传的文件

```javascript
import cloud from "@lafjs/cloud";
const AWS = require("aws-sdk");

//获取s3客户端
function getS3Client() {
  return new AWS.S3({
    accessKeyId: cloud.env.OSS_ACCESS_KEY,
    secretAccessKey: cloud.env.OSS_ACCESS_SECRET,
    // sessionToken: credentials.sessionToken,
    endpoint: "https://oss.laf.run",
    s3ForcePathStyle: true,
    signatureVersion: "v4",
    region: cloud.env.OSS_REGION,
  });
}

//拼接文件桶名字
function getInternalBucketName(bucketName) {
  const appid = cloud.env.APP_ID;
  return `${appid}-${bucketName}`;
}

//删除文件
export async function deleteAppFile(bucketName, key) {
  const s3 = getS3Client();
  const bucket = getInternalBucketName(bucketName);

  const res = await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
  return res;
}

exports.main = async function (ctx: FunctionContext) {
  const res = await deleteAppFile("test", "image/test.jpg");

  return {};
};
```

参考资料 https://github.com/labring/laf/blob/v0.8/packages/app-console/src/api/oss.js
