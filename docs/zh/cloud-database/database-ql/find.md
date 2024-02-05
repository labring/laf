---
title: 查询数据
---

# 查询数据

Laf 云数据库支持传入不同的条件来查询数据，并且对查询结果进行处理。本文档将通过示例说明如何通过 `cloud.database()` 在云函数中执行查询。

查询数据操作主要支持 `where()` `limit()` `skip()` `orderBy()` `field()` `get()` `getOne()` `count()` 等

包括：

[[toc]]

## 获取所有记录

::: tip
可通过 `where` 设置查询条件，以及通过 `limit` 设置显示数量等
:::

```typescript
import cloud from '@lafjs/cloud'
// 获取数据库引用
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // get 方法发起查询请求，不带 where 就是直接查询全部数据，默认最多查询 100 条数据
  const result1 = await db.collection('user').get()
  console.log(result1) 

  // get 方法发起查询请求，配置 where 条件
  const result2 = await db.collection('user').where({
    name: 'laf'
  }).get()
  console.log(result2) 

  // get 方法发起查询请求，想一次获取更多数据，最多一次获取 1000 条数据
  const result3 = await db.collection('user').limit(1000).get()
  console.log(result3) 
}
```

`get()` 前面支持 `where()`、`limit()`、`skip()`、`orderBy()`、`field()` 等操作。下面会逐一讲解。

## 获取一条记录

如果我们查询的数据只有一条，我们也可以使用 getOne 方法，它和 get 方法不同的是它只能获取一条数据，并且 data 的格式为对象。

```typescript
import cloud from '@lafjs/cloud'
// 获取数据库引用
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  const res = await db.collection('user').getOne()
  console.log(res)  
// getOne 获取的结果：
// {
//   ok: true,
//   data: { _id: '641d21992de2b789c963e5e0', name: 'jack' },
//   requestId: undefined
// }

  const res = await db.collection('user').get()
  console.log(res) 
// get 获取的结果：
// {
//   data: [ { _id: '641d22292de2b789c963e5fd', name: 'jack' } ],
//   requestId: undefined,
//   ok: true
// }
}
```

`getOne()` 前面支持 `where()`、`limit()`、`skip()`、`orderBy()`、`field()` 等操作。下面会逐一讲解。

## 添加查询条件

`collection.where()`

设置查询条件条件
where 可接收对象作为参数，表示筛选出拥有和传入对象相同的 key-value 的文档。支持多个条件同时筛选。

比如筛选出所有名字叫 jack 的用户：

```typescript
// 查询 user 集合中 name 字段等于 jack 的记录
await db.collection("user").where({
 name:"jack"
});
```

:::tip
这里注意，`where` 并不会去查询数据，需参考我们上面的栗子加上 `get()` 或者 `getOne()`
:::

## 根据 ID 查询数据

`collection.doc()`

跟 `where` 的区别是，`doc` 只根据_id 筛选

::: warning
如果是用 cloud.database() 新增的文档，_id 类型为字符串
如果是用 cloud.mongo.db 新增的文档，_id 类型一般为 ObjectId
:::

```typescript
// 查询 user 集合中 _id 为 '644148fd1eeb2b524dba499e' 的文档
await db.collection("user").doc('644148fd1eeb2b524dba499e').get();

// 其实等同于 where 的筛选条件只有 _id
await db.collection("user").where({
  _id: '644148fd1eeb2b524dba499e'
}).getOne();
```

```typescript
// _id 的类型为 ObjectId 的情况
import { ObjectId } from 'mongodb' // 需要在云函数顶部引入 ObjectId 类型

await db.collection("user").doc(ObjectId('644148fd1eeb2b524dba499e'));
```

## 高级查询指令

::: tip
`where` 结尾不会直接查询，需要后面加 `get` 或 `getOne`
:::

### gt 字段大于指定值

可用于查询数字、日期等类型的字段。如果是字符串对比，则会按照字典序进行比较。
  
此例子筛选出所有年龄大于 18 的用户：

```typescript
const db = cloud.database()
const _ = db.command; // 这里拿到指令
await db.collection("user").where({
    age: _.gt(18) // 表示大于 18
  },
);
```

### gte 字段大于或等于指定值

可用于查询数字、日期等类型的字段。如果是字符串对比，则会按照字典序进行比较。

```typescript
const db = cloud.database()
const _ = db.command; // 这里拿到指令
await db.collection("user").where({
    age: _.gte(18) // 表示大于或等于 18
  },
);
```

### lt 字段小于指定值

可用于查询数字、日期等类型的字段。如果是字符串对比，则会按照字典序进行比较。

### lte 字段小于或等于指定值

可用于查询数字、日期等类型的字段。如果是字符串对比，则会按照字典序进行比较。

### eq 表示字段等于某个值

`eq` 指令接受一个字面量 (literal)，可以是 `number`, `boolean`, `string`, `object`, `array`。

比如筛选出所有自己发表的文章，除了用传对象的方式：

```typescript
const myOpenID = "xxx";
await db.collection("articles").where({
  _openid: myOpenID,
});
```

还可以用指令：

```typescript
const db = cloud.database()
const _ = db.command;
const myOpenID = "xxx";
await db.collection("articles").where({
  _openid: _.eq(myOpenID),
});
```

注意 `eq` 指令比对象的方式有更大的灵活性，可以用于表示字段等于某个对象的情况，比如：

```typescript
// 这种写法表示匹配 stat.publishYear == 2018 且 stat.language == 'zh-CN'
await db.collection("articles").where({
  stat: {
    publishYear: 2018,
    language: "zh-CN",
  },
});

// 这种写法表示 stat 对象等于 { publishYear: 2018, language: 'zh-CN' }
const _ = db.command;
await db.collection("articles").where({
  stat: _.eq({
    publishYear: 2018,
    language: "zh-CN",
  }),
});
```

### neq 表示字段不等于某个值

字段不等于。`neq` 指令接受一个字面量 (literal)，可以是 `number`, `boolean`, `string`, `object`, `array`。

如筛选出品牌不为 X 的计算机：

```typescript
const _ = db.command;
await db.collection("goods").where({
  category: "computer",
  type: {
    brand: _.neq("X"),
  },
});
```

### in 字段值在给定的数组中

如：筛选出年龄为 18 或 20 岁的用户：

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.in([18, 20]),
});
```

### nin 字段值不在给定的数组中

筛选出年龄不是 18 或 20 岁的用户：

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.nin([8, 20]),
});
```

### and 表示需同时满足指定的两个或以上的条件

如筛选出年龄大于 18 小于 60 的用户：

流式写法：

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.gt(18).and(_.lt(60)),
});
```

前置写法：

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.and(_.gt(18), _.lt(60)),
});
```

### or 表示需满足所有指定条件中的至少一个

如筛选出用户年龄等于 18 或等于 60 的用户：

流式写法：

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.eq(18).or(_.eq(60)),
});
```

前置写法：

```typescript
const _ = db.command;
await db.collection("user").where({
    age: _.or(_.eq(18),_.eq(60)),
});
```

如果要跨字段“或”操作：(如筛选出内存 8g 或 cpu 3.2 ghz 的计算机)

```typescript
const _ = db.command;
await db.collection("goods").where(
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

### exists 判断字段是否存在

```typescript
const _ = db.command;
await db.collection("users").where(
  name: _.exists(true), // name 字段存在
  age: _.exists(false), // age 字段不存在
);
```

## 正则表达式查询

`new RegExp` 根据正则表达式进行筛选

例如下面可以筛选出 `version` 字段开头是 "数字+s" 的记录，并且忽略大小写：

```typescript
// 可以直接使用正则表达式
await db.collection('articles').where({
  version: /^\ds/i
})

// 或者
await db.collection('articles').where({
  version: new RegExp('^\\ds','i')
})
```

## 获取查询数量

collection.count() 查询符合条件的数量

参数

```typescript
await db.collection("goods").where({
  category: "computer",
  type: {
    memory: 8,
  },
}).count()
```

响应参数

| 字段      | 类型    | 必填 | 说明                     |
| --------- | ------- | ---- | ------------------------ |
| code      | string  | 否   | 状态码，操作成功则不返回 |
| message   | string  | 否   | 错误描述                 |
| total     | Integer | 否   | 计数结果                 |
| requestId | string  | 否   | 请求序列号，用于错误排查 |

## 设置记录数量

collection.limit() 限制展示数量，最大 1000

参数说明

| 参数  | 类型    | 必填 | 说明           |
| ----- | ------- | ---- | -------------- |
| value | Integer | 是   | 限制展示的数值 |

使用示例

```typescript
await db.collection("user").limit(1).get()
```

## 设置起始位置

collection.skip() 跳过展示的数据

参数说明

| 参数  | 类型    | 必填 | 说明           |
| ----- | ------- | ---- | -------------- |
| value | Integer | 是   | 跳过展示的数据 |

使用示例

```typescript
await db.collection("user").skip(4).get()
```

## 分页查询

`skip()` 和 `limit()` 组合可做分页查询，这里不能用 `getOne()`

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // 每页显示数量
  const pageSize = 3;
  // 第几页
  const page = 2;
  const res = await db.collection('user')
  .skip((page - 1) * pageSize)
  .limit(pageSize)
  .get()
}
```

## 嵌套查询

如果是对象或数组中的某个字段进行查询

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // 查询 userInfo.name = 'Jack' 且 userInfo.age = 10 的数据
  // 写法 1
  const result1 = await db.collection('user')
  .where({
    userInfo: {
      name: "Jack",
      age: 10
    }
  }).get()
  // 写法 2
  const result2 = await db.collection('user')
  .where({
    'userInfo.name': 'Jack',
    'userInfo.age': 10
  }).get()
}
```

如数据库中 `test` 集合中有如下数据

```json
[
  {
    "arr":[{
      "name": "item-1"
    },{
      "name": "item-2"
    }]
  },
  {
    "arr":[{
      "name": "item-3"
    },{
      "name": "item-4"
    }]
  }
]
```

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // 查询 arr[0].name = 'item-1'  的数据
  const result = await db.collection('test')
  .where({
    'arr.0.name': "item-1"
  }).get()
}
```

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // 查询 arr 内某个元素的 name 为 'item-2' 的文档
  const result = await db.collection('test')
  .where({
    'arr.name': "item-2"
  }).get()
}
```

## 对结果排序

collection.orderBy() 对数据排序后再展示

参数说明

| 参数      | 类型   | 必填 | 说明                                |
| --------- | ------ | ---- | ----------------------------------- |
| field     | string | 是   | 排序的字段                          |
| orderType | string | 是   | 排序的顺序，升序 (asc) 或 降序 (desc) |

使用示例

```typescript
// 按照创建时间 createAt 的升序排序
await db.collection("user").orderBy("createAt", "asc").get()
```

## 指定返回字段

collection.field() 只返回指定字段

参数说明

| 参数 | 类型   | 必填 | 说明                                      |
| ---- | ------ | ---- | ----------------------------------------- |
| -    | object | 是   | 要过滤的字段，不返回传 0，返回传 1 |

::: tip
备注：只能指定要返回的字段或者不要返回的字段，即 `{'a': 1, 'b': 0}` 是一种错误的参数格式。默认会显示 id。
:::

使用示例

```typescript
await db.collection("user").field({ age: 1 });
```

同样的后面也要加上 `get()` 或 `getOne()` ，才可以查询到结果

## with 关联查询

with / withOne 联表查询，可以实现查询一个集合时，连同某个字段的相关联记录一同查出（可跨表），比如查询“班级”时连同班级内的“学生”一起查询出来，又比如查询“文章”时连同它的“作者”一并查出等等。

:::info
with / withOne 联表查询在 sdk 内部是先查询了主表后，再查询子表，然后在本地（云函数或客户端）完成拼接后再传回业务开发者；如果你还没有使用 with 联表查询，推荐使用聚合操作的 [lookup 联表查询](#lookup-关联查询)。
:::

### 一对多关系查询

主要用于「一对多」关系的子查询，可跨表查询，要求用户拥有子表的查询权限

```typescript
await const { data } = await db
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

### 一对一关系查询

> 类似 sql left join 查询

```typescript
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

## lookup 关联查询

:::info
lookup 联表查询并非 `collection` 下的方法！

事实上其为聚合 `aggregate` 下的方法，然而前文提到了 `with 联表查询` 用途与此一致，故在此先做说明，以避免开发者以为 lookup 不得使用，导致额外适配成 with 联表查询的成本。
:::

用途与 `with 联表查询` 基本一致，同 with 联表查询的示例：查询 article 集合时，把各记录的 tag 标签一同查出。

```typescript
const { data } = await db
  .collection("article")
  .aggregate()
  .lookup({
    from: "tag",
    localField: "id", // 主表连接键，即 article.id
    foreignField: "article_id", // 子表连接键，即 tag.article_id
    as: "tags", // 查询结果中字段重命名，缺省为子表名
  })
  .end();
console.log(data);
```
