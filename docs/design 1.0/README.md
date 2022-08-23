

# key ideas

## 使用 kube-apiserver 取代 system-server 作为 API Server

> https://kubernetes.io/zh-cn/docs/reference/using-api/

### CRDs
- Application
- CloudFunction
- ObjectStorage
- Database
- Ingress(Route)
- ApplicationSpecTemplate
- WebsiteHosting
- Collaborator

### Application CRD

#### 一个应用内所有的资源都放在一个 namespace 下，
```
namespace: app-1
  - Application
    metadata:
      name: app-1
      labels:
        appid: app-1
        created_by: user_id
    spec:
      runtime: node.js
    state: 'inited' 

  - CloudFunction:
    metadata:
      name: app-1-cf-1
      namespace: app-1
      labels:
        appid: app-1
    spec:
      code: 'CloudFunctionCode'
      timeout: 60s
      version: string
    state: ''
...
```

Challenges: 
  - 获取所有的 Application 列表: 要先查询出所有有权限的 namespace，然后再查询出所有的 Application 列表（x)
  - 作者用户绑定到 app namespace，拥有此应用的所有权限（删除资源除外？删除可考虑用修改状态来控制）
  - 编写 Admission Webhook 用来控制资源的创建，更新，删除，保护系统字段（或可考虑做一个临时CRD供创建使用？如 ApplicationCreatation）
  - 获取函数列表：根据 appid 直接查询 app namespace 下的所有函数；

#### 或者一个用户所有的资源都放在一个 namespace 下

```
namespace: user-1
  - kind: Application
    metadata:
      name: app-1
      labels:
        appid: app-1
        created_by: user_id
    spec: {...}
    state: 'inited'

  - kind: Application
    metadata:
      name: app-2
      labels:
        appid: app-2
        created_by: user_id
    spec: {...}
    state: 'inited'
```

Challenges: 
  - 获取所有的 Application 列表: 直接查询当前用户所有的 Application 列表
  - 作者用户绑定到 user namespace，拥有所有所属应用的所有权限（删除资源除外？删除可考虑用修改状态来控制）
  - 编写 Admission Webhook 用来控制资源的创建，更新，删除，保护系统字段（或可考虑做一个临时CRD供创建使用？如 ApplicationCreatation）
  - 获取函数列表：根据 appid 直接查询 user namespace 下的所有函数；


#### 或者所有应用都放在一个 namespace 下

```
namespace: laf-apps
  - Kind: Application
    metadata:
      name: app-1
      labels:
        appid: app-1
        title: AppName
        created_by: user_id
    spec: {...}
    state: 'inited'
```


Challenges: 
  - 获取所有的 Application 列表: 直接查询当前用户所有的 Application 列表（*权限似乎不是很好控制， admission webhook 不能应用到查询操作*）
  - 作者用户绑定到 apps namespace & 关联应用资源权限列表，拥有所有所属应用的所有权限（删除资源除外？删除可考虑用修改状态来控制）
  - 编写 Admission Webhook 用来控制资源的创建，更新，删除，保护系统字段（或可考虑做一个临时CRD供创建使用？如 ApplicationCreatation）
  - 获取函数列表：根据 appid 直接查询 app namespace 下的所有函数；





## 以本地开发环境为主，线上环境仅做运行时

- 废除 `函数版本管理`功能，本地开发会使用 git 管理
- 废除 `远程部署` 功能, 同上原因，应用的部署和迁移可在本地或CI/CD环境中使用 laf cli 完成
- 废除 `函数发布` 过程, 由于线上环境定位为运行时， 则去除函数「发布」过程，函数保存即部署（保存即发布），调用调试接口除外

- cli 新增 buckets 接口：buckets create, buckets delete, buckets ls, buckets get, buckets update
- cli 新增 logs 接口， 可查看 app logs 或仅 function logs？

- ？废除 `Web Logs` 功能，应该使用 laf cli 来调试函数、日志
- ？废除 `Web 依赖管理`，应该使用 laf cli 在本地完成依赖管理
- ？废除 `Web 集合管理`，或也不需要在 Web 界面提供了，直接提供开源的 mongo express 之类的东西？
- ？废除 `Web 文件管理`，或也不需要在 Web 界面提供了，直接提供 minio 

## TODO List

- [ ] 确定代码仓库的结构
- [ ] 确定开发工作内容和次序
  - application-controller
  - instance-controller
  - gateway-controller
  - oss-controller
  - database-controller

