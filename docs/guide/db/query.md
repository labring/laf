---
title: 云数据库查询
---

# {{ $frontmatter.title }}

## 查询

下面栗子是从 user 集合中查询数据。
```js
import cloud from '@lafjs/cloud'
// 获取数据库引用
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  // collection 方法接受一个字符串参数，就是要查询集合的名字。
  // get 方法发起查询请求
  const res = await db.collection('user').get()
  console.log(res) 

```
如果我们查询的数据只有一条，我们也可以使用 getOne 方法，它和 get 方法不同的是它只能获取一条数据，并且 data 的格式为对象。
```js
import cloud from '@lafjs/cloud'
// 获取数据库引用
const db = cloud.database()

export async function main(ctx: FunctionContext) {
  const res = await db.collection('user').geOne()
  console.log(res)  
// getOne 获取的结果:
// {
//   ok: true,
//   data: { _id: '641d21992de2b789c963e5e0', name: 'jack' },
//   requestId: undefined
// }

  const res = await db.collection('user').get()
  console.log(res) 
// get 获取的结果:
// {
//   data: [ { _id: '641d22292de2b789c963e5fd', name: 'jack' } ],
//   requestId: undefined,
//   ok: true
// }
```

支持 `where()`、`limit()`、`skip()`、`orderBy()`、`get()`、`update()`、`field()`、`count()` 等操作，下面我们来一一介绍。


## 添加查询条件

`collection.where()`

设置查询条件条件
where 可接收对象作为参数，表示筛选出拥有和传入对象相同的 key-value 的文档。比如筛选出所有名字叫 jack 的用户：

```js
// 查询 user 集合中 name 字段等于 jack 的记录
db.collection("user").where({
 name:"jack"
});
```

:::tip
这里注意，where 并不会发出请求，需参考我们第一个栗子加上 get
:::

## 高级查询指令
如果要表达更复杂的查询，可使用高级查询指令。
### gt
字段大于指定值。  
此例子筛选出所有年龄大于 18 的用户：
```js
const _ = db.command; // 这里拿到指令
db.collection("user").where({
    age: _.gt(18) // 表示大于 18
  },
);
```
### gte

字段大于或等于指定值。

### lt

字段小于指定值。

### lte

字段小于或等于指定值。

### eq

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

### neq

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

### in

字段值在给定的数组中。

筛选出年龄为 18 或 20 岁的用户：

```js
const _ = db.command;
db.collection("user").where({
    age: _.in([18, 20]),
});
```

### nin

字段值不在给定的数组中。

筛选出年龄不是 18 或 20 岁的用户：


```js
const _ = db.command;
db.collection("user").where({
    age: _.nin([8, 20]),
});
```

### and

表示需同时满足指定的两个或以上的条件。

如筛选出年龄大于 18 小于 60 的用户：

流式写法：

```js
const _ = db.command;
db.collection("user").where({
    age: _.gt(18).and(_.lt(60)),
});
```

前置写法：

```js
const _ = db.command;
db.collection("user").where({
    age: _.and(_.gt(18), _.lt(60)),
});
```

### or

表示需满足所有指定条件中的至少一个。如筛选出用户年龄等于 18 或等于 60 的用户：

流式写法：

```js
const _ = db.command;
db.collection("user").where({
    age: _.eq(18).or(_.eq(60)),
});
```

前置写法：

```js
const _ = db.command;
db.collection("user").where({
    age: _.or(_.eq(18),_.eq(60)),
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

## 正则表达式查询

### db.RegExp

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
## 获取查询数量

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
```

响应参数

| 字段      | 类型    | 必填 | 说明                     |
| --------- | ------- | ---- | ------------------------ |
| code      | string  | 否   | 状态码，操作成功则不返回 |
| message   | string  | 否   | 错误描述                 |
| total     | Integer | 否   | 计数结果                 |
| requestId | string  | 否   | 请求序列号，用于错误排查 |

## 设置记录数量

collection.limit()

参数说明

| 参数  | 类型    | 必填 | 说明           |
| ----- | ------- | ---- | -------------- |
| value | Integer | 是   | 限制展示的数值 |

使用示例

```js
//promise
db.collection("user")
  .limit(1)
  .get()
  .then(function (res) {});
```

## 设置起始位置

collection.skip()

参数说明

| 参数  | 类型    | 必填 | 说明           |
| ----- | ------- | ---- | -------------- |
| value | Integer | 是   | 跳过展示的数据 |

使用示例

```js
//promise
db.collection("user")
  .skip(4)
  .get()
  .then(function (res) {});
```

## 对结果排序

collection.orderBy()

参数说明

| 参数      | 类型   | 必填 | 说明                                |
| --------- | ------ | ---- | ----------------------------------- |
| field     | string | 是   | 排序的字段                          |
| orderType | string | 是   | 排序的顺序，升序(asc) 或 降序(desc) |

使用示例

```js
//promise
db.collection("user")
  .orderBy("name", "asc")
  .get()
  .then(function (res) {});
```

## 指定返回字段

collection.field()

参数说明

| 参数 | 类型   | 必填 | 说明                                      |
| ---- | ------ | ---- | ----------------------------------------- |
| -    | object | 是   | 要过滤的字段，不返回传 0，返回传 1 |

使用示例

```js
db.collection("user")
.field({ age: 1 });
```

备注：只能指定要返回的字段或者不要返回的字段。即{'a': 1, 'b': 0}是一种错误的参数格式

## with 关联查询

with / withOne 联表查询，可以实现查询一个集合时，连同某个字段的相关联记录一同查出（可跨表），比如查询“班级”时连同班级内的“学生”一起查询出来，又比如查询“文章”时连同它的“作者”一并查出等等。

:::info
with / withOne 联表查询在 sdk 内部是先查询了主表后，再查询子表，然后在本地（云函数或客户端）完成拼接后再传回业务开发者；如果你还没有使用 with 联表查询，推荐使用聚合操作的 [lookup 联表查询](#lookup-联表查询)。
:::

### 一对多关系查询

主要用于「一对多」关系的子查询，可跨表查询，要求用户拥有子表的查询权限

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

### 一对一关系查询

> 类似 sql left join 查询

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

## lookup 关联查询

:::info
lookup 联表查询并非 `collection` 下的方法！

事实上其为聚合 `aggregate` 下的方法，然而前文提到了 `with 联表查询` 用途与此一致，故在此先做说明，以避免开发者以为 lookup 不得使用，导致额外适配成 with 联表查询的成本。
:::

用途与 `with 联表查询` 基本一致，同 with 联表查询的示例: 查询 article 集合时，把各记录的 tag 标签一同查出。

```js
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
