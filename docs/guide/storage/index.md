---
title: 云存储使用介绍
---


## 介绍

前端可使用 [less-api-client sdk](https://github.com/Maslow/less-api-client-js) 上传文件。


## 文件桶（Bucket）
Laf 提供基于 `bucket` （文件桶）方式管理的文件存储服务，并内置 `public` 为一个可公共读写的文件桶。

开发者也可在开发控制台中创建其它文件桶，其它文件桶均需要文件 token 来访问，以实现应用自定义的文件访问权限控制。

> 以下演示皆为 `public` 文件桶中操作。

## 使用客户端SDK上传文件

SDK 当前默认上传到文件 bucket `public` 中
```js
// in your upload function
const inputElement = document.getElementById("fileInput")
const file = inputElement.files[0];

const ret = await cloud.uploadFile(file)
console.log(ret)
```

## 直接基于 URL 上传到 `public` 桶中
```js
import axios from 'axios'

// in your upload function
const inputElement = document.getElementById("fileInput")
const file = inputElement.files[0]
const form = new FormData() // 创建form对象
form.append("file", file) // 通过append向form对象添加数据

const base_url = cloud.fileBaseUrl
const upload_url = `${base_url}/public`

const res = await axios({
  url: upload_url,
  data: form,
  headers: {
    "Content-Type": "multipart/form-data"
  }
})

console.log(res.data)
```

## 获取文件 URL

```js
const base_url = cloud.fileBaseUrl
const file_url = `${base_url}/public/avatar.png'`

console.log(file_url)
```