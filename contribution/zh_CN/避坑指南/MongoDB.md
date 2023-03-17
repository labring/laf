# 安装

Docker Hub:

- mongodb/mongodb-community-server 是 MondoDB 团队打的包。目前版本这个包打得不太好，Dockerfile 中默认用户名是 mongodb，对容器内部分目录和外挂卷没有写权限，所以运行时需要修改用户 `--user root`。
- mongodb 是 Docker 打的包。

```bash
docker run --rm --detach --name mongod --network host -v ~/.local/share/mongodb/data:/data/db mongo
docker run --rm --interactive --tty --network host mongo mongosh
docker run --rm --interactive --network host mongo mongodump
docker run --rm --interactive mongosh --network host mongo mongorestore
```

# 访问控制

Mongodb 使用 RBAC，且在此基础上 role 还可以继承其他 role 的权限。

> 如果你不记得什么是 RBAC，请复习《计算机安全导论》。

每个 user 和 role 都注册在某一个 db 上，每个 db 有一个独立的 user 和 role 的命名空间，两个不同 db 中创建的 user 和 role 可以重名。

各个 user 和 role 虽然注册在不同 db 里，但 user 和 role 的具体信息都是统一保存在特殊 db `admin` 中。

除了特殊 db `admin` 之外，

- 一个 db 中的 user 可以属于多个不同 db 的 role。因此一个 user 最终可以具有访问其他 db 的权限。
- 一个 db 中的 role 只能涉及与本 db 有关的权限。
- 一个 db 中的 role 只能继承本 db 的其他 role。

「创建用户」本身也是一项权限，这个权限不止与一个 db 有关，因此拥有这项权限的内置 role ` userAdminAnyDatabase` 注册在特殊 db `admin` 上。首先你得在 access control 未开启时，创建一个属于这个 role 的 user 作为管理员用户。

# 备份还原

mongodump 和 mongorestore 的备份还原的 scope 是整个 MongoDB 实例。也就是说即使你只备份整个实例中某一个 db 的某一个 collection，那么备份中会记录这个 collection 在原实例中所在的 db 名，还原的时候不需要显式指定把这个 collection 还原为哪个名字的 db 的哪个名字的 collection。

mongdorestore 用 `--nsInclude` 来选择只还原这个 deployment 备份中的哪些部分。
