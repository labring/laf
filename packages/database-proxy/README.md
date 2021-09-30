![](https://github.com/Maslow/less-api/workflows/release/badge.svg?branch=v1.0.0)

## 介绍

    `less-api` 是一个「超级API」，一个 API 替代服务端 90% 的传统 APIs。

    通过一套「访问控制规则」配置数据库访问，让前端开发者“安全直连”数据库，再也不需要和服务端对接口了！

    客户端使用 `less-api` 提供的 SDK，像在服务端操作数据库那样，在客户端直接读写相应的数据即可。

    如果你了解微信小程序云开发，那么可以用 `less-api` 搭建自己的云开发。

    `less-api` 可以让产品开发初期的时候， 投入极少（甚至0）服务端开发工作，随着业务的发展，
    可以按需使用传统的 api 来部分代替，两者完全不冲突。

    `less-api` 支持运行在自建服务器环境、腾讯云\阿里云云开发、unicloud、微信小程序云开发中。

    在复杂架构的项目中， `less-api` 可以充当其中一个或多个微服务，承载部分数据操作请求。


## 谁适合使用 less-api ？

### 微信云开发用户

    如果你喜欢微信云开发的极速开发体验，但又不想局限于微信平台，那么可以基于 less-api 搭建属于自己的云开发平台！
    
    具体可了解 `less-framework` 和 `less-admin` （基于 less-api 实现的云开发框架和管理端）。

    自建云开发，可以获取极速的云开发体验，同时没有技术选型时迁移平台的烦恼顾虑。

### 个人开发者、初创创业团队

    无论你使用云开发还是自建服务器环境，在产品初期基于 `less-api` 可以极大减少服务端API的数量，
    根据我们的实践经验，初期能节约 90% 的服务端API。

    因此，在产品初期，团队可以专注于产品业务本身，快速推出最小可用产品(MVP)，快速进行产品、市场验证。

    随着业务的发展，可将部分复杂、性能、安全敏感的 API 用传统方式实现，`less-api` 继续承担一般的数据请求。

    即便是应用重构，也可逐个替换原 `less-api` 负责的请求，重构过程不影响应用正常运行，持续发布的方式重构。


## 初心场景

>最初 `less-api` 就是出于以下场景而设计的：

- 用于快速开发 MVP，专注于客户端业务，极大程度减少服务端开发工作量
- 自建属于自己的云开发环境，具体可了解 `less-framework`（基于 less-api 实现的云开发框架）

## 使用示例

```sh
    npm install less-api
```

### 服务端代码示例

```js
const app = require('express')()
const { Proxy, MongoAccessor, Policy } = require('less-api')

app.use(express.json())

// design the access control policy rules
const rules = {
    categories: {
        "read": true,
        "update": "$admin == true",
        "add": "$admin == true",
        "remove": "$admin == true"
    }
}

// create an accessor
const accessor = new MongoAccessor('mydb', 'mongodb://localhost:27017', { directConnection: true })
accessor.init()

// create a policy
const policy = new Policy(accessor)
policy.load(rules)

// create an proxy
const proxy = new Proxy(accessor, policy)

app.post('/entry', async (req, res) => {
  const { role, uid } = parseToken(req.headers['authorization'])

  // parse params
  const params = proxy.parseParams(req.body)

  const injections = {
    $role: role,
    $userid: uid
  }

  // validate query
  const result = await proxy.validate(params, injections)
  if (result.errors) {
    return res.send({
      code: 1,
      error: result.errors
    })
  }

  // execute query
  const data = await proxy.execute(params)
  return res.send({
    code: 0,
    data
  })
})

app.listen(8080, () => console.log('listening on 8080'))
```

### 客户端使用

```sh
    npm install less-api-client
```

```js
const cloud = require('less-api-client').init({
    entryUrl: 'http://localhost:8080/entry',
    getAccessToken: () => localStorage.getItem('access_token')，
    environment: 'h5',
    // environment: 'uniapp', // uniapp
    // environment: 'wxmp'  // 微信小程序
})

const db = cloud.database()

// 查询文档
const cates = await db.collection('categories').get()

// 条件查询
const articles = await db.collection('articles')
    .where({status: 'published'})
    .orderBy({createdAt: 'asc'})
    .offset(0)
    .limit(20)
    .get()

// 更新
const updated = await db.collection('articles').doc('the-doc-id').update({
    title: 'new-title'
})
```

更多使用参考[客户端使用文档](./packages/less-api-client-js/README.md)

### 数据访问安全规则示例

#### 简单示例 1：简单博客

```json
{
    "categories": {
        "read": true,
        "update": "$admin === true",
        "add": "$admin === true",
        "remove": "$admin === true"
    },
    "articles": {
        "read": true,
        "update": "$admin === true",
        "add": "$admin === true",
        "remove": "$admin === true"
    }
}
```

#### 简单示例 2：多用户博客

```json
{
    "articles": {
        "read": true,
        "update": "$userid && $userid === query.createdBy",
        "add": "$userid && data.createdBy === $userid",
        "remove": "$userid === query.createBy || $admin === true"
    }
}
```

#### 复杂示例 1： 数据验证

```json
{
    "articles": {
        "add": {
            "condition": "$userid && data.createdBy === $userid"
        },
        "remove": "$userid === query.createBy || $admin === true",
        "$schema": {
            "title": {"length": [1, 64], "required": true},
            "content": {"length": [1, 4096]},
            "like": { "number": [0,], "default": 0}
        }
    }
}
```

#### 复杂示例 2：更高级的数据验证

> 场景介绍： 用户之间站内消息表访问规则

```json
{
    "messages": {
        "read": "$userid && ($userid === query.receiver || $userid === query.sender)",
        "update": {
            "condition": "$userid && $userid === query.receiver",
            "data": {
                "read": {"in": [true]}
            }
        },
        "add": {
            "condition": "$userid && $userid === data.sender",
             "data": {
                "read": {"in": [false]}
            }
        },
        "remove": false,
        "$schema": {
            "content": {"length": [1, 20480], "required": true},
            "receiver": {"exists": "/users/id"},
            "read": { "in": [true, false], "default": false }
        }
    }
}
```

## 运行测试

安装依赖

```sh
    npm i
```

### 单元测试

```sh
    npx mocha tests/units/*.test.js
```

### 数据库访问测试
#### Mongo

使用 Docker 启动个测试数据库，等待mongo 启动成功

```sh
    docker pull mongo
    docker run -p 27017:27017 --name mongotest -d mongo
```

执行测试用例

```sh
    npx mocha tests/mongo_db/*.test.js
```

停止&删除 Mongo 实例

```sh
    docker rm -f mongotest
```

#### MySQL

使用 Docker 启动个测试数据库，等待mongo 启动成功

```sh
    docker pull mysql
    docker run --name mysqltest -e MYSQL_ROOT_PASSWORD=kissme -e MYSQL_DATABASE=testdb -d -p 3306:3306 mysql
```

手动创建测试使用的数据表：
```sql
create table IF NOT EXISTS categories (
  id int not null auto_increment,
  name varchar(64) not null, 
  created_at int, 
  primary key(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table IF NOT EXISTS articles (
  id int not null auto_increment,
  title varchar(64) not null, 
  category_id int,
  content text,
  created_at int, 
  updated_at int,
  created_by int,
  primary key(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

执行测试用例

```sh
    npx mocha tests/mysql_db/*.test.js
```

停止&删除 Mongo 实例

```sh
    docker rm -f mysqltest
```

### PostgreSQL

```sh
docker run --name pgdb -e POSTGRESQL_PASSWORD=kissme -e POSTGRESQL_DATABASE=testdb -p "5432:5432" -d  bitnami/postgresql
```

尚未支持 PostgreSQL。

### 执行所有测试用例

> 请确保已经运行 mongo 和 mysql 测试的实例；

```sh
npx mocha tests/**/*.test.js
```

##  TODO

- 实现服务端应用内数据操作事件，可订阅相应事件，触发更多自定义的业务逻辑，如表冗余统计字段，或中间统计表的更新
- 基于 Mongo 的`change watch`, 实现客户端可订阅数据变更通知，服务端通过 websocket 向客户端实时推送数据变更
- 提供 Flutter (Dart) SDK (`less-client-dart`) [完成]
- 支持 MySQL 等关系型数据库 [完成]
- 支持 MySQL 联表查询(Join) [完成]
- 支持 MongoDb 聚合
- 支持 MongoDb 事务
- 补充 schema 验证器的测试用例
