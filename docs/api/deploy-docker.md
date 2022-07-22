---
title: Docker环境变量配置
---

# {{ $frontmatter.title }}

## MongoDB 配置

| 变量名称                | 默认值        | 解释                 |
| ----------------------- | ------------- | -------------------- |
| `MONGODB_ROOT_PASSWORD` | `password123` | MongoDB 的 root 密码 |
| `SYS_DB`                | `sys_db`      | 系统数据库           |
| `SYS_DB_USER`           | `sys_user`    | 系统数据库用户       |
| `SYS_DB_PASSWORD`       | `password123` | 系统数据库密码       |

## 对象存储配置

| 变量名称              | 默认值                | 解释               |
| --------------------- | --------------------- | ------------------ |
| `MINIO_ROOT_USER`     | `minio-root-user`     | minio 平台初始账号 |
| `MINIO_ROOT_PASSWORD` | `minio-root-password` | minio 平台初始密码 |

## 平台配置

| 变量名称                     | 默认值                         | 解释                     |
| ---------------------------- | ------------------------------ | ------------------------ |
| `INIT_ROOT_ACCOUNT`          | `root`                         | Laf 平台初始账号         |
| `INIT_ROOT_ACCOUNT_PASSWORD` | `password123`                  | Laf 平台初始密码         |
| `SYS_SERVER_SECRET_SALT`     | `system-server-abcdefg1234567` | 系统密钥，用于生成 Token |
| `SYSTEM_EXTENSION_APPID`     | `000000`                       | 系统扩展应用 APPID       |
| `DEPLOY_DOMAIN`              | `127-0-0-1.nip.io`             | 部署域名                 |
| `SYS_CLIENT_HOST`            | `console.127-0-0-1.nip.io`     | 控制台访问域名           |
| `OSS_DOMAIN`                 | `oss.127-0-0-1.nip.io`         | 对象存储访问域名         |
| `APP_SERVICE_IMAGE`          | `lafyun/app-service:latest`    | 云函数服务使用的镜像     |
