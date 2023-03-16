# 部署结构

laf 后端的部署结构整体分为

- 一个后端服务器单例 server。
- 一个 MongoDB 单例，用于存储除了 laf app 业务数据之外所有需要持久化数据，比如所有用户 profile、所有 laf app 的元数据、云函数源代码。
- 多个 Kubernetes 集群用于跑用户的 laf app 业务，每个集群称为一个 Region。

每个 Region 集群中有

- 每个 laf app 一个独立命名空间。命名空间内有一个 Service 一个 Deployment。每个 Pod 内一个 runtime 实例。

	每个 Region 中没有独立的 laf app 命名空间，一个 Region 中的 laf app 不能与另一个 Region 中的 laf app 重名。

- 一个 MinIO 单例，用于存储本 Region 中所有 laf app 的 bucket。

	一个 laf app 可以创建多个 bucket。每个 laf app 没有独立的 bucket 命名空间，一个 laf app 的 bucket 不能与另一个 laf app 的 bucket 重名，但 laf 强制所有 bucket 名都以所属的 laf app 名为前缀。

- 一个 MongoDB 单例，用于存储本 Region 中所有 laf app 的数据库。

	一个 laf app 被自动分配有且仅有一个 MongoDB 数据库。

# 源代码结构

- `cd ./server/src` server。
	- `cd ./prisma` 操作存储元数据的 MongoDB。
	- `cd ./user` 管理用户信息。
	- `cd ./region` 用于操作 app 与 Region 的对应关系。比如判断某个 app 属于哪个 Region，这个 app 在所属 Region 集群中的 k8s namespace 叫什么。
	- `cd ./database` 操作各个 Region 中的 MongoDB。比如在已知的某个新 app 所属 Region 中创建一个新 db 以分配给这个新 app 用。
	- `cd ./storage` 操作各个 Region 中的 MinIO。比如在某个 Region 中创建一个新 bucket 以分配给提出申请的 app 用。
	- `cd ./application` 创建删除 laf app 项目。
	- `cd ./instance` 在 Region 中启停已创建的 laf app 项目单例。
	- `cd ./function` 管理各个 laf app 的云函数源代码。
	- `cd ./dependency` 设置各个 laf app 的 Node.js 依赖，仅设置不安装。
	- `cd ./gateway` 配置
	- `cd ./initializer` 新部署的 laf 第一次运行的初始化工作。
- `cd ./runtime/nodejs/src` runtime
