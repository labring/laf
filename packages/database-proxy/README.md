
## 介绍

    `database-proxy` 是一个「超级API」，一个 API 替代服务端 90% 的传统 APIs。

    通过一套「访问控制规则」配置数据库访问，让前端开发者“安全直连”数据库，再也不需要和服务端对接口了！

    客户端使用 `laf-client-sdk` ，像在服务端操作数据库那样，在客户端直接读写相应的数据即可。

## 使用

```sh
    npm install database-proxy
```

### 服务端代码示例

```js
const app = require('express')()
const { Proxy, MongoAccessor, Policy } = require('database-proxy')

app.use(express.json())

// design the access control policy rules
const rules = {
    categories: {
        "read": true,
        "update": "!uid",
        "add": "!uid",
        "remove": "!uid"
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

app.post('/proxy', async (req, res) => {
  const { uid } = parseToken(req.headers['authorization'])

  const injections = {
    uid: uid
  }

  // parse params
  const params = proxy.parseParams(req.body)

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
    npm install laf-client-sdk
```

```js
const cloud = require('laf-client-sdk').init({
    dbProxyUrl: 'http://localhost:8080/proxy',
    getAccessToken: () => localStorage.getItem('access_token')
})

const db = cloud.database()

// 查询文档
const res = await db.collection('categories').get()

// 条件查询
const res = await db.collection('articles')
    .where({status: 'published'})
    .orderBy({createdAt: 'asc'})
    .offset(0)
    .limit(20)
    .get()

// 更新
const res = await db.collection('articles')
    .doc('the-doc-id').update({
        title: 'new-title'
    })
```

更多使用参考[客户端使用文档](./packages/laf-client-sdk/README.md)

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
    docker run --rm -p 27018:27017 --name mongotest -d mongo
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

### 执行所有测试用例

> 请确保已经运行 mongo 和 mysql 测试的实例；

```sh
npx mocha tests/**/*.test.js
```