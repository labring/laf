# 对象存储

- 块存储就是一个二进制块，像一个硬盘，有固定长度，你可以随机访问第任何字节。
- 文件存储就是一个文件系统，树形结构。
- 对象存储就是一个键值数据库，键是文件名，值是文件内容。

块存储格式化一下就成了文件存储，文件存储安装个数据库就成了对象存储。

显然对象存储的成本低于文件存储，文件存储的成本低于块存储。反证法，假设文件存储的成本高于块存储，那么云厂商就会把块存储格式化一下拿出来当文件存储卖，使得文件存储价格的价格降到和块存储一样。

# 安装

docker: minio/minio

```bash
# https://min.io/docs/minio/container/index.html
docker run --rm -d --network host --name minio -v ~/.local/share/minio/data:/data minio/minio server /data --console-address :9090
```

mc 没有 docker 版，直接官网下载放进 `/usr/local/bin`。

<https://min.io/docs/minio/linux/reference/minio-mc.html>

# 访问控制

MinIO 支持多用户，根用户的用户名和密码可以在部署时自定义，根用户默认用户名和密码都是 `minioadmin`。

<https://min.io/docs/minio/container/administration/identity-access-management/minio-user-management.html>

每个用户没有自己的命名空间，整个 MinIO 实例就一个命名空间，两个用户创建的 bucket 不可重名，只不过可以设置访问权限。

MinIO 用 user group 功能实现 RBAC。

> 如果你不记得什么是 RBAC，请复习《计算机安全导论》。

# 虚拟主机

S3 支持把 bucket 名作为子域名，每个 bucket 构成一个 HTTP 虚拟主机，共享 IP 地址。服务端通过 HTTP 请求头中的 `Host` 区分。
