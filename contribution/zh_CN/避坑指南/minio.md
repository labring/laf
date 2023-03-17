# 安装

docker: minio/minio

```bash
# https://min.io/docs/minio/container/index.html
alias dockerun-minio="docker run --rm -d --network host --name minio -v ~/.local/share/minio/data:/data minio/minio server /data --console-address :90\
90"
```

mc 没有 docker 版，直接官网下载放进 `/usr/local/bin`

<https://min.io/docs/minio/linux/reference/minio-mc.html>

# 访问控制

MinIO 支持多用户，根用户的用户名和密码可以在部署时自定义，根用户默认用户名和密码都是 `minioadmin`。

<https://min.io/docs/minio/container/administration/identity-access-management/minio-user-management.html>

每个用户没有自己的命名空间，整个 MinIO 实例就一个命名空间，所有 bucket 都对所有用户可见，只不过可以设置访问权限。

MinIO 用 user group 功能实现 RBAC。

# 虚拟主机

S3 支持把 bucket 名作为子域名，每个 bucket 构成一个 HTTP 虚拟主机，共享 IP 地址。服务端通过 HTTP 请求头中的 `Host` 区分。
