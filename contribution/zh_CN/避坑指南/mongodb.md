# 安装

docker: mongodb/mongodb-community-server

```bash
docker run --rm -d --name mongodb --network host -u root -v ~/.local/share/mongodb/data:/data/db mongodb/mongodb-community-server
docker run --rm -it --name mongosh --network host -u root mongodb/mongodb-community-server mongosh
docker run --rm -i --name mongosh --network host -u root mongodb/mongodb-community-server mongodump
docker run --rm -i --name mongosh --network host -u root mongodb/mongodb-community-server mongorestore
```

mongodb 的 Dockerfile 中默认是 mongodb 用户，对容器内部分目录和外挂卷没有写权限，所以用 `-u root`。

# 访问控制

Mongodb 使用 RBAC，且在此基础上 role 还可以继承其他 role 的权限。

> 如果你不记得什么是 RBAC，请复习《计算机安全导论》。

虽然所有 user 和 role 的信息都是统一保存在特殊 db `admin` 中，但每个 db 有一个独立的**用户信息**命名空间，在这个命名空间里创建 user 和 role，两个不同 db 中创建的用户名可以重名。

除了特殊 db `admin` 之外，

- 一个 db 中的 user 可以属于多个不同 db 的 role。因此一个 user 最终可以具有访问其他 db 的权限。
- 一个 db 中的 role 只能涉及与本 db 有关的权限。
- 一个 db 中的 role 只能继承本 db 的其他 role。

「创建用户」本身也是一项权限，这个权限不止与一个 db 有关，因此拥有这项权限的 built-in role ` userAdminAnyDatabase` 属于特殊 db `admin` 的命名空间。首先你得在 access control 未开启时，创建一个属于这个 role 的用户作为管理员用户。

# 备份还原

mongodump 和 mongorestore 的备份还原作用对象是整个 MongoDB 实例。

mongodump 用 `--db` 和 `--collection` 选择整个 deployment 的哪些部分，这样的结果不是「一个完整 collection 的备份」，而是「一个不完整的 deployment 的备份」，重复备份另一些 db 或 collection 不会覆盖之前的。

mongdorestore 用 `--nsInclude` 来选择只还原这个 deployment 备份中的哪些部分。

因此将一个 MongoDB 实例中的一个 db 的一个 collection 备份出来后，无法还原到另一个 deployment 中的不同 db 不同 collection 中，除非使用特别选项。
