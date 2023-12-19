---
title: 云存储简介
---

# {{ $frontmatter.title }}

`laf` 云存储是基于 [MinIO](https://min.io/) 提供的对象存储服务，提供了完全的 MinIO 的对象存储服务，同时也是标准的 s3 接口，我们可以通过 s3 api 来控制云存储中文件的增删改查。

## 创建 bucket

![create-bucket-1](../../doc-images/create-bucket-1.png)

step 1.切换到存储页

step 2.点击加号

step 3.设置 bucket 名称，名称由`小写字母` `数字` `-` 组成

step 4.设置读写权限

step 5.点击确定创建成功

## Web 控制台上传文件

![upload](../../doc-images/upload.png)

step 1.点击上传按钮

step 2.选择上传文件或者文件夹，文件和文件夹需分别上传

## Web 控制台获取文件访问地址

点击文件后面的眼睛按钮，如果是开启了可读属性，即已经获取到文件的访问/下载地址。

如果是开启了不可读属性，点击眼睛按钮会获得临时访问链接。

## Web 控制台删除文件

点击文件垃圾桶符号，即可删除文件，但是目前在 Web 控制台无法批量删除文件。

