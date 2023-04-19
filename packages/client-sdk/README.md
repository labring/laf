### 介绍

Javascript client sdk of [`laf`](https://github.com/labring/laf).

### 安装

```sh
    npm install laf-client-sdk
```

### 使用示例

```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  // the laf app server base url
  baseUrl: "https://APPID.lafyun.com",
  // the database proxy entry, `app` is the policy name which response for the security of database access
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => localStorage.getItem("access_token"),
});

const db = cloud.database();

// query documents
const cates = await db.collection("categories").get();

// query a document
const cate = await db.collection("categories").doc("the-doc-id").get();

// query with options
const articles = await db
  .collection("articles")
  .where({})
  .orderBy({ createdAt: "asc" })
  .offset(0)
  .limit(20)
  .get();

// count documents
const total = await db
  .collection("articles")
  .where({ createdBy: "the-user-id" })
  .count();

// update document
const updated = await db.collection("articles").doc("the-doc-id").update({
  title: "new-title",
});

// add a document
const created = await db.collection("articles").add({
  title: "less api database",
  content: "less api more life",
  createdAt: new Date("2019-09-01"),
});

// delete a document
const removed = await db.collection("articles").doc("the-doc-id").remove();
```

#### 微信小程序中使用

```js
const cloud = new Cloud({
  // the laf app server base url
  baseUrl: "https://APPID.lafyun.com",
  // the database proxy entry, `app` is the policy name which response for the security of database access
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => wx.getStorageSync('access_token'),
  environment: "wxmp",
});
```

#### UNI-APP 中使用

```js
const cloud = new Cloud({
  // the laf app server base url
  baseUrl: "https://APPID.lafyun.com",
  // the database proxy entry, `app` is the policy name which response for the security of database access
  getAccessToken: () => localStorage.getItem("access_token"),
  environment: "uniapp",
});
```

### 数据库操作

客户端数据操作采取了[腾讯云云开发的接口](https://github.com/TencentCloudBase/tcb-js-sdk/blob/master/docs/database.md)设计。

# API Reference

- [获取数据库的引用](#获取数据库的引用)
- [获取集合的引用](#获取集合的引用)
  - [集合 Collection](#集合-collection)
  - [记录 Record / Document](#记录-record--document)
  - [查询筛选指令 Query Command](#查询筛选指令-query-command)
  - [字段更新指令 Update Command](#字段更新指令-update-command)
- [支持的数据类型](#支持的数据类型)
- [新增文档](#新增文档)
- [查询文档](#查询文档)
  - [添加查询条件](#添加查询条件)
  - [获取查询数量](#获取查询数量)
  - [设置记录数量](#设置记录数量)
  - [设置起始位置](#设置起始位置)
  - [对结果排序](#对结果排序)
  - [指定返回字段](#指定返回字段)
  - [查询指令](#查询指令)
    - [eq](#eq)
    - [neq](#neq)
    - [gt](#gt)
    - [gte](#gte)
    - [lt](#lt)
    - [lte](#lte)
    - [in](#in)
    - [nin](#nin)
    - [and](#and)
    - [or](#or)
  - [正则表达式查询](#正则表达式查询)
    - [db.RegExp](#dbregexp)
- [删除文档](#删除文档)
- [更新文档](#更新文档)
  - [更新指定文档](#更新指定文档)
  - [更新文档，如果不存在则创建](#更新文档如果不存在则创建)
  - [批量更新文档](#批量更新文档)
  - [更新指令](#更新指令)
    - [set](#set)
    - [inc](#inc)
    - [mul](#mul)
    - [remove](#remove)
    - [push](#push)
    - [pop](#pop)
    - [unshift](#unshift)
    - [shift](#shift)

## 获取数据库的引用

```js
const db = cloud.database();
```

## 获取集合的引用

```js
// 获取 `user` 集合的引用
const collection = db.collection("user");
```

### 集合 Collection

通过 `db.collection(name)` 可以获取指定集合的引用，在集合上可以进行以下操作

| 类型     | 接口    | 说明                                                                               |
| -------- | ------- | ---------------------------------------------------------------------------------- |
| 写       | add     | 新增记录（触发请求）                                                               |
| 计数     | count   | 获取复合条件的记录条数                                                             |
| 读       | get     | 获取集合中的记录，如果有使用 where 语句定义查询条件，则会返回匹配结果集 (触发请求) |
| 引用     | doc     | 获取对该集合中指定 id 的记录的引用                                                 |
| 查询条件 | where   | 通过指定条件筛选出匹配的记录，可搭配查询指令（eq, gt, in, ...）使用                |
|          | skip    | 跳过指定数量的文档，常用于分页，传入 offset                                        |
|          | orderBy | 排序方式                                                                           |
|          | limit   | 返回的结果集(文档数量)的限制，有默认值和上限值                                     |
|          | field   | 指定需要返回的字段                                                                 |

查询及更新指令用于在 `where` 中指定字段需满足的条件，指令可通过 `db.command` 对象取得。

### 记录 Record / Document

通过 `db.collection(collectionName).doc(docId)` 可以获取指定集合上指定 id 的记录的引用，在记录上可以进行以下操作

| 接口 | 说明   |
| ---- | ------ | ---------------------- |
| 写   | set    | 覆写记录               |
|      | update | 局部更新记录(触发请求) |
|      | remove | 删除记录(触发请求)     |
| 读   | get    | 获取记录(触发请求)     |

### 查询筛选指令 Query Command

以下指令挂载在 `db.command` 下

| 类型     | 接口 | 说明                               |
| -------- | ---- | ---------------------------------- |
| 比较运算 | eq   | 字段 ==                            |
|          | neq  | 字段 !=                            |
|          | gt   | 字段 >                             |
|          | gte  | 字段 >=                            |
|          | lt   | 字段 <                             |
|          | lte  | 字段 <=                            |
|          | in   | 字段值在数组里                     |
|          | nin  | 字段值不在数组里                   |
| 逻辑运算 | and  | 表示需同时满足指定的所有条件       |
|          | or   | 表示需同时满足指定条件中的至少一个 |

### 字段更新指令 Update Command

以下指令挂载在 `db.command` 下

| 类型 | 接口    | 说明                             |
| ---- | ------- | -------------------------------- |
| 字段 | set     | 设置字段值                       |
|      | remove  | 删除字段                         |
|      | inc     | 加一个数值，原子自增             |
|      | mul     | 乘一个数值，原子自乘             |
|      | push    | 数组类型字段追加尾元素，支持数组 |
|      | pop     | 数组类型字段删除尾元素，支持数组 |
|      | shift   | 数组类型字段删除头元素，支持数组 |
|      | unshift | 数组类型字段追加头元素，支持数组 |

## 支持的数据类型

数据库提供以下几种数据类型：

- String：字符串
- Number：数字
- Object：对象
- Array：数组
- Bool：布尔值
- GeoPoint：地理位置点
- GeoLineStringL: 地理路径
- GeoPolygon: 地理多边形
- GeoMultiPoint: 多个地理位置点
- GeoMultiLineString: 多个地理路径
- GeoMultiPolygon: 多个地理多边形
- Date：时间
- Null

以下对几个特殊的数据类型做个补充说明

1. 时间 Date

Date 类型用于表示时间，精确到毫秒，可以用 JavaScript 内置 Date 对象创建。需要特别注意的是，用此方法创建的时间是客户端时间，不是服务端时间。如果需要使用服务端时间，应该用 API 中提供的 serverDate 对象来创建一个服务端当前时间的标记，当使用了 serverDate 对象的请求抵达服务端处理时，该字段会被转换成服务端当前的时间，更棒的是，我们在构造 serverDate 对象时还可通过传入一个有 offset 字段的对象来标记一个与当前服务端时间偏移 offset 毫秒的时间，这样我们就可以达到比如如下效果：指定一个字段为服务端时间往后一个小时。

那么当我们需要使用客户端时间时，存放 Date 对象和存放毫秒数是否是一样的效果呢？不是的，我们的数据库有针对日期类型的优化，建议大家使用时都用 Date 或 serverDate 构造时间对象。

```js
//服务端当前时间
new db.serverDate();
```

```js
//服务端当前时间加1S
new db.serverDate({
  offset: 1000,
});
```

2. 地理位置

参考：[GEO 地理位置](#GEO地理位置)

3. Null

Null 相当于一个占位符，表示一个字段存在但是值为空。

## 新增文档

方法 1： collection.add(data)

示例：

| 参数 | 类型   | 必填 | 说明                                       |
| ---- | ------ | ---- | ------------------------------------------ |
| data | object | 是   | {\_id: '10001', 'name': 'Ben'} \_id 非必填 |

```js
//promise
collection
  .add({
    name: "Ben",
  })
  .then((res) => {});

//callback
collection.add(
  {
    name: "Ben",
  },
  function (err, res) {}
);
```

方法 2： collection.doc().set(data)

也可通过 `set` 方法新增一个文档，需先取得文档引用再调用 `set` 方法。
如果文档不存在，`set` 方法会创建一个新文档。

```js
//promise
collection.doc().set({
  name: "Hey",
});

//callback
collection.doc().set(
  {
    name: "Hey",
  },
  function (err, res) {}
);
```

## 查询文档

支持 `where()`、`limit()`、`skip()`、`orderBy()`、`get()`、`update()`、`field()`、`count()` 等操作。

只有当调用`get()` `update()`时才会真正发送请求。
注：默认取前 100 条数据，最大取前 100 条数据。

### 添加查询条件

collection.where()
参数

设置过滤条件
where 可接收对象作为参数，表示筛选出拥有和传入对象相同的 key-value 的文档。比如筛选出所有类型为计算机的、内存为 8g 的商品：

```js
db.collection("goods").where({
  category: "computer",
  type: {
    memory: 8,
  },
});
```

如果要表达更复杂的查询，可使用高级查询指令，比如筛选出所有内存大于 8g 的计算机商品：

```js
const _ = db.command; // 取指令
db.collection("goods").where({
  category: "computer",
  type: {
    memory: _.gt(8), // 表示大于 8
  },
});
```

### 获取查询数量

collection.count()

参数

```js
//promise
db.collection("goods")
  .where({
    category: "computer",
    type: {
      memory: 8,
    },
  })
  .count()
  .then(function (res) {});

//callback
db.collection("goods")
  .where({
    category: "computer",
    type: {
      memory: 8,
    },
  })
  .count(function (err, res) {});
```

响应参数

| 字段      | 类型    | 必填 | 说明                     |
| --------- | ------- | ---- | ------------------------ |
| code      | string  | 否   | 状态码，操作成功则不返回 |
| message   | string  | 否   | 错误描述                 |
| total     | Integer | 否   | 计数结果                 |
| requestId | string  | 否   | 请求序列号，用于错误排查 |

### 设置记录数量

collection.limit()

参数说明

| 参数  | 类型    | 必填 | 说明           |
| ----- | ------- | ---- | -------------- |
| value | Integer | 是   | 限制展示的数值 |

使用示例

```js
//promise
collection
  .limit(1)
  .get()
  .then(function (res) {});

//callback
collection.limit(1).get(function (err, res) {});
```

### 设置起始位置

collection.skip()

参数说明

| 参数  | 类型    | 必填 | 说明           |
| ----- | ------- | ---- | -------------- |
| value | Integer | 是   | 跳过展示的数据 |

使用示例

```js
//promise
collection
  .skip(4)
  .get()
  .then(function (res) {});

//callback
collection.skip(4).get(function (err, res) {});
```

### 对结果排序

collection.orderBy()

参数说明

| 参数      | 类型   | 必填 | 说明                                |
| --------- | ------ | ---- | ----------------------------------- |
| field     | string | 是   | 排序的字段                          |
| orderType | string | 是   | 排序的顺序，升序(asc) 或 降序(desc) |

使用示例

```js
//promise
collection
  .orderBy("name", "asc")
  .get()
  .then(function (res) {});

//callback
collection.orderBy("name", "asc").get(function (err, res) {});
```

### 指定返回字段

collection.field()

参数说明

| 参数 | 类型   | 必填 | 说明                               |
| ---- | ------ | ---- | ---------------------------------- |
| -    | object | 是   | 要过滤的字段，不返回传 0，返回传 1 |

使用示例

```js
collection.field({ age: 1 });
```

备注：只能指定要返回的字段或者不要返回的字段。即{'a': 1, 'b': 0}是一种错误的参数格式

### 查询指令

#### eq

表示字段等于某个值。`eq` 指令接受一个字面量 (literal)，可以是 `number`, `boolean`, `string`, `object`, `array`。

比如筛选出所有自己发表的文章，除了用传对象的方式：

```js
const myOpenID = "xxx";
db.collection("articles").where({
  _openid: myOpenID,
});
```

还可以用指令：

```js
const _ = db.command;
const myOpenID = "xxx";
db.collection("articles").where({
  _openid: _.eq(openid),
});
```

注意 `eq` 指令比对象的方式有更大的灵活性，可以用于表示字段等于某个对象的情况，比如：

```js
// 这种写法表示匹配 stat.publishYear == 2018 且 stat.language == 'zh-CN'
db.collection("articles").where({
  stat: {
    publishYear: 2018,
    language: "zh-CN",
  },
});
// 这种写法表示 stat 对象等于 { publishYear: 2018, language: 'zh-CN' }
const _ = db.command;
db.collection("articles").where({
  stat: _.eq({
    publishYear: 2018,
    language: "zh-CN",
  }),
});
```

#### neq

字段不等于。`neq` 指令接受一个字面量 (literal)，可以是 `number`, `boolean`, `string`, `object`, `array`。

如筛选出品牌不为 X 的计算机：

```js
const _ = db.command;
db.collection("goods").where({
  category: "computer",
  type: {
    brand: _.neq("X"),
  },
});
```

#### gt

字段大于指定值。

如筛选出价格大于 2000 的计算机：

```js
const _ = db.command;
db.collection("goods").where({
  category: "computer",
  price: _.gt(2000),
});
```

#### gte

字段大于或等于指定值。

#### lt

字段小于指定值。

#### lte

字段小于或等于指定值。

#### in

字段值在给定的数组中。

筛选出内存为 8g 或 16g 的计算机商品：

```js
const _ = db.command;
db.collection("goods").where({
  category: "computer",
  type: {
    memory: _.in([8, 16]),
  },
});
```

#### nin

字段值不在给定的数组中。

筛选出内存不是 8g 或 16g 的计算机商品：

```js
const _ = db.command;
db.collection("goods").where({
  category: "computer",
  type: {
    memory: _.nin([8, 16]),
  },
});
```

#### and

表示需同时满足指定的两个或以上的条件。

如筛选出内存大于 4g 小于 32g 的计算机商品：

流式写法：

```js
const _ = db.command;
db.collection("goods").where({
  category: "computer",
  type: {
    memory: _.gt(4).and(_.lt(32)),
  },
});
```

前置写法：

```js
const _ = db.command;
db.collection("goods").where({
  category: "computer",
  type: {
    memory: _.and(_.gt(4), _.lt(32)),
  },
});
```

#### or

表示需满足所有指定条件中的至少一个。如筛选出价格小于 4000 或在 6000-8000 之间的计算机：

流式写法：

```js
const _ = db.command;
db.collection("goods").where({
  category: "computer",
  type: {
    price: _.lt(4000).or(_.gt(6000).and(_.lt(8000))),
  },
});
```

前置写法：

```js
const _ = db.command;
db.collection("goods").where({
  category: "computer",
  type: {
    price: _.or(_.lt(4000), _.and(_.gt(6000), _.lt(8000))),
  },
});
```

如果要跨字段 “或” 操作：(如筛选出内存 8g 或 cpu 3.2 ghz 的计算机)

```js
const _ = db.command;
db.collection("goods").where(
  _.or(
    {
      type: {
        memory: _.gt(8),
      },
    },
    {
      type: {
        cpu: 3.2,
      },
    }
  )
);
```

### 正则表达式查询

#### db.RegExp

根据正则表达式进行筛选

例如下面可以筛选出 `version` 字段开头是 "数字+s" 的记录，并且忽略大小写：

```js
// 可以直接使用正则表达式
db.collection('articles').where({
  version: /^\ds/i
})

// 或者
db.collection('articles').where({
  version: new db.RegExp({
    regex: '^\\ds'   // 正则表达式为 /^\ds/，转义后变成 '^\\ds'
    options: 'i'    // i表示忽略大小写
  })
})
```

## 删除文档

方式 1 通过  指定文档 ID

collection.doc(\_id).remove()

```js
// 清理全部数据
collection
  .get()
  .then((res) => {
    const promiseList = res.data.map((document) => {
      return collection.doc(document._id).remove();
    });
    Promise.all(promiseList);
  })
  .catch((e) => {});
```

方式 2 条件查找文档然后直接批量删除

collection.where().remove()

```js
// 删除字段a的值大于2的文档
//promise
collection
  .where({
    a: _.gt(2),
  })
  .remove()
  .then(function (res) {});

//callback
//promise
collection
  .where({
    a: _.gt(2),
  })
  .remove(function (err, res) {});
```

## 更新文档

### 更新指定文档

collection.doc().update()

```js
collection.doc("doc-id").update({
  name: "Hey",
});
```

### 更新文档，如果不存在则创建

collection.doc().set()

```js
//promise
collection
  .doc("doc-id")
  .set({
    name: "Hey",
  })
  .then(function (res) {});

//callback
collection.doc("doc-id").set(
  {
    name: "Hey",
  },
  function (err, res) {}
);
```

### 批量更新文档

collection.update()

```js
//promise
collection
  .where({ name: _.eq("hey") })
  .update({
    age: 18,
  })
  .then(function (res) {});
//callback
collection.where({ name: _.eq("hey") }).update(
  {
    age: 18,
  },
  function (err, res) {}
);
```

### 更新指令

#### set

更新指令。用于设定字段等于指定值。这种方法相比传入纯 JS 对象的好处是能够指定字段等于一个对象：

```js
// 以下方法只会更新 property.location 和 property.size，如果 property 对象中有
//promise
db.collection("photo")
  .doc("doc-id")
  .update({
    data: {
      property: {
        location: "guangzhou",
        size: 8,
      },
    },
  })
  .then(function (res) {});
//callback
db.collection("photo")
  .doc("doc-id")
  .update(
    {
      data: {
        property: {
          location: "guangzhou",
          size: 8,
        },
      },
    },
    function (err, res) {}
  );
```

#### inc

更新指令。用于指示字段自增某个值，这是个原子操作，使用这个操作指令而不是先读数据、再加、再写回的好处是：

1. 原子性：多个用户同时写，对数据库来说都是将字段加一，不会有后来者覆写前者的情况
2. 减少一次网络请求：不需先读再写

之后的 mul 指令同理。

如给收藏的商品数量加一：

```js
const _ = db.command;
//promise
db.collection("user")
  .where({
    _openid: "my-open-id",
  })
  .update({
    count: {
      favorites: _.inc(1),
    },
  })
  .then(function (res) {});
//callback
db.collection("user")
  .where({
    _openid: "my-open-id",
  })
  .update(
    {
      count: {
        favorites: _.inc(1),
      },
    },
    function (err, res) {}
  );
```

#### mul

更新指令。用于指示字段自乘某个值。

#### remove

更新指令。用于表示删除某个字段。如某人删除了自己一条商品评价中的评分：

```js
//promise
const _ = db.command;
db.collection("comments")
  .doc("comment-id")
  .update({
    rating: _.remove(),
  })
  .then(function (res) {});

//callback
const _ = db.command;
db.collection("comments")
  .doc("comment-id")
  .update(
    {
      rating: _.remove(),
    },
    function (err, res) {}
  );
```

#### push

向数组尾部追加元素，支持传入单个元素或数组

```js
const _ = db.command;
//promise
db.collection("comments")
  .doc("comment-id")
  .update({
    // users: _.push('aaa')
    users: _.push(["aaa", "bbb"]),
  })
  .then(function (res) {});

//callback
db.collection("comments")
  .doc("comment-id")
  .update(
    {
      // users: _.push('aaa')
      users: _.push(["aaa", "bbb"]),
    },
    function (err, res) {}
  );
```

#### pop

删除数组尾部元素

```js
const _ = db.command;
//promise
db.collection("comments")
  .doc("comment-id")
  .update({
    users: _.pop(),
  })
  .then(function (res) {});

//callback
db.collection("comments")
  .doc("comment-id")
  .update(
    {
      users: _.pop(),
    },
    function (err, res) {}
  );
```

#### unshift

向数组头部添加元素，支持传入单个元素或数组。使用同 push

#### shift

删除数组头部元素。使用同 pop

### With 子表查询（支持 MongoDb 和 MySQL）

#### 一对多关系查询

> 主要用于「一对多」关系的子查询，可跨库查询，要求用户拥有子表的查询权限

```js
const { data } = await db
  .collection("article")
  .with({
    query: db.collection("tag"),
    localField: "id", // 主表连接键，即 article.id
    foreignField: "article_id", // 子表连接键，即 tag.article_id
    as: "tags", // 查询结果中字段重命名，缺省为子表名
  })
  .get();

console.log(data);
//  [ { id: 1, name: xxx, tags: [...] }  ]
```

#### 一对一关系查询

> 类似 left join 查询，但此种方法支持 MongoDb 和 SQL

```js
const { data } = await db
  .collection("article")
  .withOne({
    query: db.collection("user"),
    localField: "author_id", // 主表连接键，即 article.id
    foreignField: "id", // 子表连接键，即 tag.article_id
    as: "author", // 查询结果中字段重命名，缺省为子表名
  })
  .get();

console.log(data);
//  [ { id: 1, name: xxx, author: {...} }  ]
```

## GEO 地理位置

注意：**如果需要对类型为地理位置的字段进行搜索，一定要建立地理位置索引**。

### GEO 数据类型

#### Point

用于表示地理位置点，用经纬度唯一标记一个点，这是一个特殊的数据存储类型。

签名：`Point(longitude: number, latitude: number)`

示例：

```js
new db.Geo.Point(longitude, latitude);
```

#### LineString

用于表示地理路径，是由两个或者更多的 `Point` 组成的线段。

签名：`LineString(points: Point[])`

示例：

```js
new db.Geo.LineString([
  new db.Geo.Point(lngA, latA),
  new db.Geo.Point(lngB, latB),
  // ...
]);
```

#### Polygon

用于表示地理上的一个多边形（有洞或无洞均可），它是由一个或多个**闭环** `LineString` 组成的几何图形。

由一个环组成的 `Polygon` 是没有洞的多边形，由多个环组成的是有洞的多边形。对由多个环（`LineString`）组成的多边形（`Polygon`），第一个环是外环，所有其他环是内环（洞）。

签名：`Polygon(lines: LineString[])`

示例：

```js
new db.Geo.Polygon([
  new db.Geo.LineString(...),
  new db.Geo.LineString(...),
  // ...
])
```

#### MultiPoint

用于表示多个点 `Point` 的集合。

签名：`MultiPoint(points: Point[])`

示例：

```js
new db.Geo.MultiPoint([
  new db.Geo.Point(lngA, latA),
  new db.Geo.Point(lngB, latB),
  // ...
]);
```

#### MultiLineString

用于表示多个地理路径 `LineString` 的集合。

签名：`MultiLineString(lines: LineString[])`

示例：

```js
new db.Geo.MultiLineString([
  new db.Geo.LineString(...),
  new db.Geo.LineString(...),
  // ...
])
```

#### MultiPolygon

用于表示多个地理多边形 `Polygon` 的集合。

签名：`MultiPolygon(polygons: Polygon[])`

示例：

```js
new db.Geo.MultiPolygon([
  new db.Geo.Polygon(...),
  new db.Geo.Polygon(...),
  // ...
])
```

### GEO 操作符

#### geoNear

按从近到远的顺序，找出字段值在给定点的附近的记录。

签名：

```js
db.command.geoNear(options: IOptions)

interface IOptions {
  geometry: Point // 点的地理位置
  maxDistance?: number // 选填，最大距离，米为单位
  minDistance?: number // 选填，最小距离，米为单位
}
```

示例：

```js
db.collection("user").where({
  location: db.command.geoNear({
    geometry: new db.Geo.Point(lngA, latA),
    maxDistance: 1000,
    minDistance: 0,
  }),
});
```

#### geoWithin

找出字段值在指定 Polygon / MultiPolygon 内的记录，无排序

签名：

```js
db.command.geoWithin(IOptions);

interface IOptions {
  geometry: Polygon | MultiPolygon; // 地理位置
}
```

示例：

```js
// 一个闭合的区域
const area = new Polygon([
  new LineString([
    new Point(lngA, latA),
    new Point(lngB, latB),
    new Point(lngC, latC),
    new Point(lngA, latA),
  ]),
]);

// 搜索 location 字段在这个区域中的 user
db.collection("user").where({
  location: db.command.geoWithin({
    geometry: area,
  }),
});
```

#### geoIntersects

找出字段值和给定的地理位置图形相交的记录

签名：

```js
db.command.geoIntersects(IOptions);

interface IOptions {
  geometry:
    | Point
    | LineString
    | MultiPoint
    | MultiLineString
    | Polygon
    | MultiPolygon; // 地理位置
}
```

示例：

```js
// 一条路径
const line = new LineString([new Point(lngA, latA), new Point(lngB, latB)]);

// 搜索 location 与这条路径相交的 user
db.collection("user").where({
  location: db.command.geoIntersects({
    geometry: line,
  }),
});
```
