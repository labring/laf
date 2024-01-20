---
title: 数据库运算
---

# 数据库运算

**等同于 mongoDB 聚合操作符概念**

## 算术操作符

### abs

<!--
/// meta
keyword: abs，绝对值
-->

返回一个数字的绝对值。  

#### API 说明

语法如下：  

```typescript
db.command.aggregate.abs(<number>)
```

`abs` 传入的值除了数字常量外，也可以是任何最终解析成一个数字的表达式。  

 如果表达式解析为 `null` 或者指向一个不存在的字段，则 `abs` 的结果是 `null`。如果值解析为 `NaN`，则结果是 `NaN`。  

#### 示例代码

 假设集合 `ratings` 有如下记录：  

```typescript
{ _id: 1, start: 5, end: 8 }
{ _id: 2, start: 4, end: 4 }
{ _id: 3, start: 9, end: 7 }
{ _id: 4, start: 6, end: 7 }
```

···
可以用如下方式求得各个记录的 `start` 和 `end` 之间的绝对差异大小：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('ratings').aggregate()
  .project({
    delta: $.abs($.subtract(['$start', '$end']))
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id" : 1, "delta" : 3 }
{ "_id" : 2, "delta" : 0 }
{ "_id" : 3, "delta" : 2 }
{ "_id" : 4, "delta" : 1 }
```

### add

<!--
/// meta
keyword: 相加，add，日期
-->

将数字相加或将数字加在日期上。如果数组中的其中一个值是日期，那么其他值将被视为毫秒数加在该日期上。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.add([<表达式1>, <表达式2>, ...])
```

表达式可以是形如 `$ + 指定字段`，也可以是普通字符串。只要能够被解析成字符串即可。  

#### 示例代码

 假设集合 `staff` 有如下记录：  

```typescript
{ _id: 1, department: "x", sales: 5, engineer: 10, lastUpdate: ISODate("2019-05-01T00:00:00Z") }
{ _id: 2, department: "y", sales: 10, engineer: 20, lastUpdate: ISODate("2019-05-01T02:00:00Z") }
{ _id: 3, department: "z", sales: 20, engineer: 5, lastUpdate: ISODate("2019-05-02T03:00:00Z") }
```

**数字求和**

 可以用如下方式求得各个记录人数总数：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('staff').aggregate()
  .project({
    department: 1,
    total: $.add(['$sales', '$engineer'])
  })
  .end()
```

返回结果如下：  

```typescript
{ _id: 1, department: "x", total: 15 }
{ _id: 2, department: "y", total: 30 }
{ _id: 3, department: "z", total: 25 }
```

**增加日期值**

 如下操作可以获取各个记录的 `lastUpdate` 加一个小时之后的值：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('staff').aggregate()
  .project({
    department: 1,
    lastUpdate: $.add(['$lastUpdate', 60*60*1000])
  })
  .end()
```

返回结果如下：  

```typescript
{ _id: 1, department: "x", lastUpdate: ISODate("2019-05-01T01:00:00Z") }
{ _id: 2, department: "y", lastUpdate: ISODate("2019-05-01T03:00:00Z") }
{ _id: 3, department: "z", lastUpdate: ISODate("2019-05-02T04:00:00Z") }
```

### ceil

向上取整，返回大于或等于给定数字的最小整数。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.ceil(<number>)
```

`<number>` 可以是任意解析为数字的表达式。如果表达式解析为 `null` 或指向一个不存在的字段，则返回 `null`，如果解析为 `NaN`，则返回 `NaN`。  

#### 示例代码

 假设集合 `sales` 有如下记录：  

```typescript
{ _id: 1, sales: 5.2 }
{ _id: 2, sales: 1.32 }
{ _id: 3, sales: -3.2 }
```

可以用如下方式取各个数字的向上取整值：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('sales').aggregate()
  .project({
    sales: $.ceil('$sales')
  })
  .end()
```

返回结果如下：  

```typescript
{ _id: 1, sales: 6 }
{ _id: 2, sales: 2 }
{ _id: 3, sales: -3 }
```

### divide

传入被除数和除数，求商。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.divide([<被除数表达式>, <除数表达式>])
```

表达式可以是任意解析为数字的表达式。  

#### 示例代码

 假设集合 `railroads` 有如下记录：  

```typescript
{ _id: 1, meters: 5300 }
{ _id: 2, meters: 64000 }
{ _id: 3, meters: 130 }
```

可以用如下方式取各个数字转换为千米之后的值：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('railroads').aggregate()
  .project({
    km: $.divide(['$meters', 1000])
  })
  .end()
```

返回结果如下：  

```typescript
{ _id: 1, km: 5.3 }
{ _id: 2, km: 64 }
{ _id: 3, km: 0.13 }
```

### exp

取 e（自然对数的底数，欧拉数）的 n 次方。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.exp(<exponent>)
```

`<exponent>` 可以是任意解析为数字的表达式。如果表达式解析为 `null` 或指向一个不存在的字段，则返回 `null`，如果解析为 `NaN`，则返回 `NaN`。  

#### 示例代码

 假设集合 `math` 有如下记录：  

```typescript
{ _id: 1, exp: 0 }
{ _id: 2, exp: 1 }
{ _id: 3, exp: 2 }
```

```typescript
const $ = db.command.aggregate
let res = await db.collection('math').aggregate()
  .project({
    result: $.exp('$exp')
  })
  .end()
```

返回结果如下：  

```typescript
{ _id: 1, result: 1 }
{ _id: 2, result: 2.71828182845905 }
{ _id: 3, result: 7.38905609893065 }
```

### floor

向下取整，返回大于或等于给定数字的最小整数。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.floor(<number>)
```

`<number>` 可以是任意解析为数字的表达式。如果表达式解析为 `null` 或指向一个不存在的字段，则返回 `null`，如果解析为 `NaN`，则返回 `NaN`。  

#### 示例代码

 假设集合 `sales` 有如下记录：  

```typescript
{ _id: 1, sales: 5.2 }
{ _id: 2, sales: 1.32 }
{ _id: 3, sales: -3.2 }
```

可以用如下方式取各个数字的向下取整值：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('sales').aggregate()
  .project({
    sales: $.floor('$sales')
  })
  .end()
```

返回结果如下：  

```typescript
{ _id: 1, sales: 5 }
{ _id: 2, sales: 1 }
{ _id: 3, sales: -4 }
```

### ln

计算给定数字在自然对数值。  

#### API 说明

语法如下：  

```typescript
db.command.aggregate.ln(<number>)
```

`<number>` 可以是任意解析为非负数字的表达式。  

`ln` 等价于 `log([<number>, Math.E])`，其中 `Math.E` 是 `JavaScript` 获取 `e` 的值的方法。  

#### 示例代码

假设集合 curve 有如下记录：

```typescript
{ _id: 1, x: 1 }
{ _id: 2, x: 2 }
{ _id: 3, x: 3 }
```

计算 ln(x) 的值：

```typescript
const $ = db.command.aggregate
let res = await db.collection('curve').aggregate()
  .project({
    log: $.ln('$x')
  })
  .end()
```

返回结果如下：

```typescript
{ _id: 1, ln: 0 }
{ _id: 2, ln: 0.6931471805599453 }
{ _id: 3, ln: 1.0986122886681098 }
```

### log

计算给定数字在给定对数底下的 log 值。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.log([<number>, <base>])
```

`<number>` 可以是任意解析为非负数字的表达式。`<base>` 可以是任意解析为大于 1 的数字的表达式。  

 如果任一参数解析为 `null` 或指向任意一个不存在的字段，`log` 返回 `null`。如果任一参数解析为 `NaN`，`log` 返回 `NaN`。  

#### 示例代码

 假设集合 `curve` 有如下记录：  

```typescript
{ _id: 1, x: 1 }
{ _id: 2, x: 2 }
{ _id: 3, x: 3 }
```

计算 `log2(x)` 的值：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('curve').aggregate()
  .project({
    log: $.log(['$x', 2])
  })
  .end()
```

返回结果如下：  

```typescript
{ _id: 1, log: 0 }
{ _id: 2, log: 1 }
{ _id: 3, log: 1.58496250072 }
```

### log10

计算给定数字在对数底为 10 下的 log 值。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.log(<number>)
```

`<number>` 可以是任意解析为非负数字的表达式。  

 `log10` 等同于 `log` 方法的第二个参数固定为 10。  

#### 示例代码

#### db.command.aggregate.log10

计算给定数字在对数底为 10 下的 log 值。  

语法如下：  

```typescript
db.command.aggregate.log(<number>)
```

`<number>` 可以是任意解析为非负数字的表达式。  

 `log10` 等同于 `log` 方法的第二个参数固定为 10。

### mod

取模运算，取数字取模后的值。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.mod([<dividend>, <divisor>])
```

第一个数字是被除数，第二个数字是除数。参数可以是任意解析为数字的表达式。  

#### 示例代码

 假设集合 `shopping` 有如下记录：  

```typescript
{ _id: 1, bags: 3, items: 5 }
{ _id: 2, bags: 2, items: 8 }
{ _id: 3, bags: 5, items: 16 }
```

各记录取 `items` 除以 `bags` 的余数（`items % bags`）：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('shopping').aggregate()
  .project({
    overflow: $.mod(['$items', '$bags'])
  })
  .end()
```

返回结果如下：  

```typescript
{ _id: 1, overflow: 2 }
{ _id: 2, overflow: 0 }
{ _id: 3, overflow: 1 }
```

### multiply

取传入的数字参数相乘的结果。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.multiply([<expression1>, <expression2>, ...])
```

参数可以是任意解析为数字的表达式。  

#### 示例代码

 假设集合 `fruits` 有如下记录：  

```typescript
{ "_id": 1, "name": "apple", "price": 10, "quantity": 100 }
{ "_id": 2, "name": "orange", "price": 15, "quantity": 50 }
{ "_id": 3, "name": "lemon", "price": 5, "quantity": 20 }
```

求各个水果的的总价值：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('fruits').aggregate()
  .project({
    name: 1,
    total: $.multiply(['$price', '$quantity']),
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "name": "apple", "total": 1000 }
{ "_id": 2, "name": "orange", "total": 750 }
{ "_id": 3, "name": "lemo", "total": 100 }
```

### pow

求给定基数的指数次幂。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.pow([<base>, <exponent>])
```

参数可以是任意解析为数字的表达式。  

#### 示例代码

 假设集合 `stats` 有如下记录：  

```typescript
{ "_id": 1, "x": 2, "y": 3 }
{ "_id": 2, "x": 5, "y": 7 }
{ "_id": 3, "x": 10, "y": 20 }
```

求 `x` 和 `y` 的平方和：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('stats').aggregate()
  .project({
    sumOfSquares: $.add([$.pow(['$x', 2]), $.pow(['$y', 2])]),
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "sumOfSquares": 13 }
{ "_id": 2, "sumOfSquares": 74 }
{ "_id": 3, "sumOfSquares": 500 }
```

### sqrt

求平方根。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.sqrt([<number>])
```

参数可以是任意解析为非负数字的表达式。  

#### 示例代码

 假设直角三角形集合 `triangle` 有如下记录：  

```typescript
{ "_id": 1, "x": 2, "y": 3 }
{ "_id": 2, "x": 5, "y": 7 }
{ "_id": 3, "x": 10, "y": 20 }
```

假设 `x` 和 `y` 分别为两直角边，则求斜边长：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('triangle').aggregate()
  .project({
    len: $.sqrt([$.add([$.pow(['$x', 2]), $.pow(['$y', 2])])]),
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "len": 3.605551275463989 }
{ "_id": 2, "len": 8.602325267042627 }
{ "_id": 3, "len": 22.360679774997898 }
```

### subtract

将两个数字相减然后返回差值，或将两个日期相减然后返回相差的毫秒数，或将一个日期减去一个数字返回结果的日期。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.subtract([<expression1>, <expression2>])
```

参数可以是任意解析为数字或日期的表达式。  

#### 示例代码

 假设集合 `scores` 有如下记录：  

```typescript
{ "_id": 1, "max": 10, "min": 1 }
{ "_id": 2, "max": 7, "min": 5 }
{ "_id": 3, "max": 6, "min": 6 }
```

求各个记录的 `max` 和 `min` 的差值。：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('scores').aggregate()
  .project({
    diff: $.subtract(['$max', '$min'])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "diff": 9 }
{ "_id": 2, "diff": 2 }
{ "_id": 3, "diff": 0 }
```

### trunc

将数字截断为整形。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.trunc(<number>)
```

参数可以是任意解析为数字的表达式。  

#### 示例代码

 假设集合 `scores` 有如下记录：  

```typescript
{ "_id": 1, "value": 1.21 }
{ "_id": 2, "value": 3.83 }
{ "_id": 3, "value": -4.94 }
```

```typescript
const $ = db.command.aggregate
let res = await db.collection('scores').aggregate()
  .project({
    int: $.trunc('$value')
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "value": 1 }
{ "_id": 2, "value": 3 }
{ "_id": 3, "value": -4 }
```

## 数组操作符

### arrayElemAt

返回在指定数组下标的元素。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.arrayElemAt([<array>, <index>])
```

`<array>` 可以是任意解析为数组的表达式。  

 `<index>` 可以是任意解析为整形的表达式。如果是正数，`arrayElemAt` 返回在 `index` 位置的元素，如果是负数，`arrayElemAt` 返回从数组尾部算起的 `index` 位置的元素。  

#### 示例代码

 假设集合 `exams` 有如下记录：  

```typescript
{ "_id": 1, "scores": [80, 60, 65, 90] }
{ "_id": 2, "scores": [78] }
{ "_id": 3, "scores": [95, 88, 92] }
```

求各个第一次考试的分数和和最后一次的分数：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('exams').aggregate()
  .project({
    first: $.arrayElemAt(['$scores', 0]),
    last: $.arrayElemAt(['$scores', -1]),
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "first": 80, "last": 90 }
{ "_id": 2, "first": 78, "last": 78 }
{ "_id": 3, "first": 95, "last": 92 }
```

### arrayToObject

将一个数组转换为对象。  

#### API 说明

 语法可以取两种：  

 第一种：传入一个二维数组，第二维的数组长度必须为 2，其第一个值为字段名，第二个值为字段值  

```typescript
db.command.aggregate.arrayToObject([
  [<key1>, <value1>],
  [<key2>, <value2>],
  ...
])
```

第二种：传入一个对象数组，各个对象必须包含字段 `k` 和 `v`，分别指定字段名和字段值  

```typescript
db.command.aggregate.arrayToObject([
  { "k": <key1>, "v": <value1> },
  { "k": <key2>, "v": <value2> },
  ...
])
```

传入 `arrayToObject` 的参数只要可以解析为上述两种表示法之一即可。  

#### 示例代码

 假设集合 `shops` 有如下记录：  

```typescript
{ "_id": 1, "sales": [ ["max", 100], ["min", 50] ] }
{ "_id": 2, "sales": [ ["max", 70], ["min", 60] ] }
{ "_id": 3, "sales": [ { "k": "max", "v": 50 }, { "k": "min", "v": 30 } ] }
```

将数组转换为对象：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('shops').aggregate()
  .project({
    sales: $.arrayToObject('$sales'),
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "sales": { "max": 100, "min": 50 } }
{ "_id": 2, "sales": { "max": 70, "min": 60 } }
{ "_id": 3, "sales": { "max": 50, "min": 30 } }
```

### concatArrays

将多个数组拼接成一个数组。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.concatArrays([ <array1>, <array2>, ... ])
```

参数可以是任意解析为数组的表达式。  

#### 示例代码

 假设集合 `items` 有如下记录：  

```typescript
{ "_id": 1, "fruits": [ "apple" ], "vegetables": [ "carrot" ] }
{ "_id": 2, "fruits": [ "orange", "lemon" ], "vegetables": [ "cabbage" ] }
{ "_id": 3, "fruits": [ "strawberry" ], "vegetables": [ "spinach" ] }
```

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    list: $.concatArrays(['$fruits', '$vegetables']),
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "list": [ "apple", "carrot" ] }
{ "_id": 2, "list": [ "orange", "lemon", "cabbage" ] }
{ "_id": 3, "list": [ "strawberry", "spinach" ] }
```

### filter

根据给定条件返回满足条件的数组的子集。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.filter({
  input: <array>,
  as: <string>,
  cond: <expression>
})
```

|字段 |说明                                                           |
|---- |----                                                           |
|input|一个可以解析为数组的表达式                                                |
|as  |可选，用于表示数组各个元素的变量，默认为 this                                      |
|cond |一个可以解析为布尔值的表达式，用于判断各个元素是否满足条件，各个元素的名字由 as 参数决定（参数名需加 $$ 前缀，如 $$this）|

参数可以是任意解析为数组的表达式。  

#### 示例代码

 假设集合 `fruits` 有如下记录：  

```typescript
{
  "_id": 1,
  "stock": [
    { "name": "apple", "price": 10 },
    { "name": "orange", "price": 20 }
  ],
}
{
  "_id": 2,
  "stock": [
    { "name": "lemon", "price": 15 },
  ],
}
```

```typescript
const _ = db.command
const $ = db.command.aggregate
let res = await db.collection('fruits').aggregate()
  .project({
    stock: $.filter({
      input: '$stock',
      as: 'item',
      cond: $.gte(['$$item.price', 15])
    })
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "stock": [ { "name": "orange", "price": 20} ] }
{ "_id": 2, "stock": [ { "name": "lemon", "price": 15 } ] }
```

### in

给定一个值和一个数组，如果值在数组中则返回 `true`，否则返回 `false`。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.in([<value>, <array>])
```

`<value>` 可以是任意表达式。  

 `<array>` 可以是任意解析为数组的表达式。  

#### 示例代码

 假设集合 `shops` 有如下记录：  

```typescript
{ "_id": 1, "topsellers": ["bread", "ice cream", "butter"] }
{ "_id": 2, "topsellers": ["ice cream", "cheese", "yagurt"] }
{ "_id": 3, "topsellers": ["croissant", "cucumber", "coconut"] }
```

标记销量最高的商品包含 `ice cream` 的记录。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    included: $.in(['ice cream', '$topsellers'])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "included": true }
{ "_id": 2, "included": true }
{ "_id": 3, "included": false }
```

### indexOfArray

在数组中找出等于给定值的第一个元素的下标，如果找不到则返回 -1。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.indexOfArray([ <array expression>, <search expression>, <start>, <end> ])
```

|字段 |类型  |说明                                      |
|---- |----  |----                                      |
|-  |string |一个可以解析为数组的表达式，如果解析为 null，则 indexOfArray 返回 null     |
|-  |string |对数据各个元素应用的条件匹配表达式                       |
|-  |integer|可选，用于指定搜索的开始下标，必须是非负整数                  |
|-  |integer|可选，用于指定搜索的结束下标，必须是非负整数，指定了 时也应指定，否则 默认当做|

参数可以是任意解析为数组的表达式。  

#### 示例代码

 假设集合 `stats` 有如下记录：  

```typescript
{
  "_id": 1,
  "sales": [ 1, 6, 2, 2, 5 ]
}
{
  "_id": 2,
  "sales": [ 4, 2, 1, 5, 2 ]
}
{
  "_id": 3,
  "sales": [ 2, 5, 3, 3, 1 ]
}
```

```typescript
const $ = db.command.aggregate
let res = await db.collection('stats').aggregate()
  .project({
    index: $.indexOfArray(['$sales', 2, 2])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "index": 2 }
{ "_id": 2, "index": 4 }
{ "_id": 3, "index": -1 }
```

### isArray

判断给定表达式是否是数组，返回布尔值。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.isArray(<expression>)
```

参数可以是任意表达式。  

#### 示例代码

 假设集合 `stats` 有如下记录：  

```typescript
{
  "_id": 1,
  "base": 10,
  "sales": [ 1, 6, 2, 2, 5 ]
}
{
  "_id": 2,
  "base": 1,
  "sales": 100
}
```

计算总销量，如果 `sales` 是数字，则求 `sales * base`，如果 `sales` 是数组，则求数组元素之和与 `base` 的乘积。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('stats').aggregate()
  .project({
    sum: $.cond({
      if: $.isArray('$sales'),
      then: $.multiply([$.sum(['$sales']), '$base']),
      else: $.multiply(['$sales', '$base']),
    })
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "sum": 160 }
{ "_id": 2, "sum": 100 }
```

### map

类似 JavaScript Array 上的 `map` 方法，将给定数组的每个元素按给定转换方法转换后得出新的数组。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.map({
  input: <expression>,
  as: <string>,
  in: <expression>
})
```

|字段 |说明                                                   |
|---- |----                                                   |
|input|一个可以解析为数组的表达式                                        |
|as  |可选，用于表示数组各个元素的变量，默认为 this                              |
|in  |一个可以应用在给定数组的各个元素上的表达式，各个元素的名字由 as 参数决定（参数名需加 $$ 前缀，如 $$this）|

#### 示例代码

 假设集合 `stats` 有如下记录：  

```typescript
{
  "_id": 1,
  "sales": [ 1.32, 6.93, 2.48, 2.82, 5.74 ]
}
{
  "_id": 2,
  "sales": [ 2.97, 7.13, 1.58, 6.37, 3.69 ]
}
```

将各个数字截断为整形，然后求和  

```typescript
const $ = db.command.aggregate
let res = await db.collection('stats').aggregate()
  .project({
    truncated: $.map({
      input: '$sales',
      as: 'num',
      in: $.trunc('$$num'),
    })
  })
  .project({
    total: $.sum('$truncated')
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "total": 16 }
{ "_id": 2, "total": 19 }
```

### objectToArray

将一个对象转换为数组。方法把对象的每个键值对都变成输出数组的一个元素，元素形如 `{ k: <key>, v: <value> }`。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.objectToArray(<object>)
```

#### 示例代码

 假设集合 `items` 有如下记录：  

```typescript
{ "_id": 1, "attributes": { "color": "red", "price": 150 } }
{ "_id": 2, "attributes": { "color": "blue", "price": 50 } }
{ "_id": 3, "attributes": { "color": "yellow", "price": 10 } }
```

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    array: $.objectToArray('$attributes')
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "array": [{ "k": "color", "v": "red" }, { "k": "price", "v": 150 }] }
{ "_id": 2, "array": [{ "k": "color", "v": "blue" }, { "k": "price", "v": 50 }] }
{ "_id": 3, "array": [{ "k": "color", "v": "yellow" }, { "k": "price", "v": 10 }] }
```

### range

返回一组生成的序列数字。给定开始值、结束值、非零的步长，`range` 会返回从开始值开始逐步增长、步长为给定步长、但不包括结束值的序列。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.range([<start>, <end>, <non-zero step>])
```

|字段     |说明                         |
|----     |----                         |
|start    |开始值，一个可以解析为整形的表达式          |
|end     |结束值，一个可以解析为整形的表达式          |
|non-zero step|可选，步长，一个可以解析为非零整形的表达式，默认为 1 |

#### 示例代码

 假设集合 `stats` 有如下记录：  

```typescript
{ "_id": 1, "max": 52 }
{ "_id": 2, "max": 38 }
```

```typescript
const $ = db.command.aggregate
db.collection('stats').aggregate()
  .project({
    points: $.range([0, '$max', 10])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "points": [0, 10, 20, 30, 40, 50] }
{ "_id": 2, "points": [0, 10, 20, 30] }
```

### reduce

类似 JavaScript 的 `reduce` 方法，应用一个表达式于数组各个元素然后归一成一个元素。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.reduce({
  input: <array>
  initialValue: <expression>,
  in: <expression>
})
```

|字段     |说明                                                    |
|----     |----                                                    |
|input    |输入数组，可以是任意解析为数组的表达式                                   |
|initialValue |初始值                                                   |
|in      |用来作用于每个元素的表达式，在 in 中有两个可用变量，value 是表示累计值的变量，this 是表示当前数组元素的变量|

#### 示例代码

**简易字符串拼接**

 假设集合 `player` 有如下记录：  

```typescript
{ "_id": 1, "fullname": [ "Stephen", "Curry" ] }
{ "_id": 2, "fullname": [ "Klay", "Thompsom" ] }
```

获取各个球员的全名，并加 `Player:` 前缀：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('player').aggregate()
  .project({
    info: $.reduce({
      input: '$fullname',
      initialValue: 'Player:',
      in: $.concat(['$$value', ' ', '$$this']),
    })
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "info": "Player: Stephen Curry" }
{ "_id": 2, "info": "Player: Klay Thompson" }
```

获取各个球员的全名，不加前缀：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('player').aggregate()
  .project({
    name: $.reduce({
      input: '$fullname',
      initialValue: '',
      in: $.concat([
        '$$value',
        $.cond({
          if: $.eq(['$$value', '']),
          then: '',
          else: ' ',
        }),
        '$$this',
      ]),
    })
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "name": "Stephen Curry" }
{ "_id": 2, "name": "Klay Thompson" }
```

### reverseArray

返回给定数组的倒序形式。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.reverseArray(<array>)
```

参数可以是任意解析为数组表达式。  

#### 示例代码

 假设集合 `stats` 有如下记录：  

```typescript
{
  "_id": 1,
  "sales": [ 1, 2, 3, 4, 5 ]
}
```

取 `sales` 倒序：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('stats').aggregate()
  .project({
    reversed: $.reverseArray('$sales'),
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "reversed": [5, 4, 3, 2, 1] }
```

### size

返回数组长度。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.size(<array>)
```

`<array>` 可以是任意解析为数组的表达式。  

#### 示例代码

 假设集合 `shops` 有如下记录：  

```typescript
{ "_id": 1, "staff": [ "John", "Middleton", "George" ] }
{ "_id": 2, "staff": [ "Steph", "Jack" ] }
```

计算各个商店的雇员数量：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('shops').aggregate()
  .project({
    totalStaff: $.size('$staff')
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "totalStaff": 3 }
{ "_id": 2, "totalStaff": 2 }
```

### slice

类似 JavaScritp 的 `slice` 方法。返回给定数组的指定子集。  

#### API 说明

 语法有两种：  

 返回从开头或结尾开始的 `n` 个元素：  

```typescript
db.command.aggregate.slice([<array>, <n>])
```

返回从指定位置算作数组开头、再向后或向前的 `n` 个元素：  

```typescript
db.command.aggregate.slice([<array>, <position>, <n>])
```

`<array>` 可以是任意解析为数组的表达式。  

 `<position>` 可以是任意解析为整形的表达式。如果是正数，则将数组的第 `<position>` 个元素作为数组开始；如果 `<position>` 比数组长度更长，`slice` 返回空数组。如果是负数，则将数组倒数第 `<position>` 个元素作为数组开始；如果 `<position>` 的绝对值大于数组长度，则开始位置即为数组开始位置。  

 `<n>` 可以是任意解析为整形的表达式。如果 `<position>` 有提供，则 `<n>` 必须为正整数。如果是正数，`slice` 返回前 `n` 个元素。如果是负数，`slice` 返回后 `n` 个元素。  

#### 示例代码

 假设集合 `people` 有如下记录：  

```typescript
{ "_id": 1, "hobbies": [ "basketball", "football", "tennis", "badminton" ] }
{ "_id": 2, "hobbies": [ "golf", "handball" ] }
{ "_id": 3, "hobbies": [ "table tennis", "swimming", "rowing" ] }
```

统一返回前两个爱好：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('fruits').aggregate()
  .project({
    hobbies: $.slice(['$hobbies', 2]),
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "hobbies": [ "basketball", "football" ] }
{ "_id": 2, "hobbies": [ "golf", "handball" ] }
{ "_id": 3, "hobbies": [ "table tennis", "swimming" ] }
```

### zip

把二维数组的第二维数组中的相同序号的元素分别拼装成一个新的数组进而组装成一个新的二维数组。如可将 `[ [ 1, 2, 3 ], [ "a", "b", "c" ] ]` 转换成 `[ [ 1, "a" ], [ 2, "b" ], [ 3, "c" ] ]`。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.zip({
  inputs: [<array1>, <array2>, ...],
  useLongestLength: <boolean>,
  defaults: <array>
})
```

`inputs` 是一个二维数组（`inputs` 不可以是字段引用），其中每个元素的表达式（这个可以是字段引用）都可以解析为数组。如果其中任意一个表达式返回 `null`，`<inputs>` 也返回 `null`。如果其中任意一个表达式不是指向一个合法的字段 / 解析为数组 / 解析为 `null`，则返回错误。  

 `useLongestLength` 决定输出数组的长度是否采用输入数组中的最长数组的长度。默认为 `false`，即输入数组中的最短的数组的长度即是输出数组的各个元素的长度。  

 `defaults` 是一个数组，用于指定在输入数组长度不一的情况下时采用的数组各元素默认值。指定这个字段则必须指定 `useLongestLength`，否则返回错误。如果 `useLongestLength` 是 `true` 但是 `defaults` 是空或没有指定，则 `zip` 用 `null` 做数组元素的缺省默认值。指定各元素默认值时 `defaults` 数组的长度必须是输入数组最大的长度。  

#### 示例代码

 假设集合 `stats` 有如下记录：  

```typescript
{ "_id": 1, "zip1": [1, 2], "zip2": [3, 4], "zip3": [5, 6] ] }
{ "_id": 2, "zip1": [1, 2], "zip2": [3], "zip3": [4, 5, 6] ] }
{ "_id": 3, "zip1": [1, 2], "zip2": [3] ] }
```

**只传 inputs**

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    zip: $.zip({
      inputs: [
        '$zip1', // 字段引用
        '$zip2',
        '$zip3',
      ],
    })
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "zip": [ [1, 3, 5], [2, 4, 6] ] }
{ "_id": 2, "zip": [ [1, 3, 4] ] }
{ "_id": 3, "zip": null }
```

**设置 useLongestLength**

 如果设 `useLongestLength` 为 `true`：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    zip: $.zip({
      inputs: [
        '$zip1', // 字段引用
        '$zip2',
        '$zip3',
      ],
      useLongestLength: true,
    })
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "zip": [ [1, 3, 5], [2, 4, 6] ] }
{ "_id": 2, "zip": [ [1, 3, 4], [2, null, 5], [null, null, 6] ] }
{ "_id": 3, "zip": null }
```

**设置 defaults**

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    zip: $.zip({
      inputs: [
        '$zip1', // 字段引用
        '$zip2',
        '$zip3',
      ],
      useLongestLength: true,
      defaults: [-300, -200, -100],
    })
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "zip": [ [1, 3, 5], [2, 4, 6] ] }
{ "_id": 2, "zip": [ [1, 3, 4], [2, -200, 5], [-300, -200, 6] ] }
{ "_id": 3, "zip": null }
```

## 布尔操作符

### and

给定多个表达式，`and` 仅在所有表达式都返回 `true` 时返回 `true`，否则返回 `false`。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.and([<expression1>, <expression2>, ...])
```

如果表达式返回 `false`、`null`、`0`、或 `undefined`，表达式会解析为 `false`，否则对其他返回值都认为是 `true`。  

#### 示例代码

 假设集合 `price` 有如下记录：  

```typescript
{ "_id": 1, "min": 10, "max": 100 }
{ "_id": 2, "min": 60, "max": 80 }
{ "_id": 3, "min": 30, "max": 50 }
```

求 `min` 大于等于 30 且 `max` 小于等于 80 的记录。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    fullfilled: $.and([$.gte(['$min', 30]), $.lte(['$max', 80])])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "fullfilled": false }
{ "_id": 2, "fullfilled": true }
{ "_id": 3, "fullfilled": true }
```

### not

给定一个表达式，如果表达式返回 `true`，则 `not` 返回 `false`，否则返回 `true`。注意表达式不能为逻辑表达式（`and`、`or`、`nor`、`not`）。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.not(<expression>)
```

如果表达式返回 `false`、`null`、`0`、或 `undefined`，表达式会解析为 `false`，否则对其他返回值都认为是 `true`。  

#### 示例代码

 假设集合 `price` 有如下记录：  

```typescript
{ "_id": 1, "min": 10, "max": 100 }
{ "_id": 2, "min": 60, "max": 80 }
{ "_id": 3, "min": 30, "max": 50 }
```

求 `min` 不大于 40 的记录。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    fullfilled: $.not($.gt(['$min', 40]))
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "fullfilled": true }
{ "_id": 2, "fullfilled": false }
{ "_id": 3, "fullfilled": true }
```

### or

给定多个表达式，如果任意一个表达式返回 `true`，则 `or` 返回 `true`，否则返回 `false`。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.or([<expression1>, <expression2>, ...])
```

如果表达式返回 `false`、`null`、`0`、或 `undefined`，表达式会解析为 `false`，否则对其他返回值都认为是 `true`。  

#### 示例代码

 假设集合 `price` 有如下记录：  

```typescript
{ "_id": 1, "min": 10, "max": 100 }
{ "_id": 2, "min": 50, "max": 60 }
{ "_id": 3, "min": 30, "max": 50 }
```

求 `min` 小于 40 或 `max` 大于 60 的记录。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    fullfilled: $.or([$.lt(['$min', 40]), $.gt(['$max', 60])])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "fullfilled": true }
{ "_id": 2, "fullfilled": false }
{ "_id": 3, "fullfilled": true }
```

## 比较操作符

### cmp

给定两个值，返回其比较值：  

#### API 说明

 如果第一个值小于第二个值，返回 -1
如果第一个值大于第二个值，返回 1
如果两个值相等，返回 0  

 语法如下：  

```typescript
db.command.aggregate.cmp([<expression1>, <expression2>])
```

#### 示例代码

 假设集合 `price` 有如下记录：  

```typescript
{ "_id": 1, "shop1": 10, "shop2": 100 }
{ "_id": 2, "shop1": 80, "shop2": 20 }
{ "_id": 3, "shop1": 50, "shop2": 50 }
```

求 `shop1` 和 `shop2` 的各个物品的价格对比。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    compare: $.cmp(['$shop1', '$shop2']))
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "compare": -1 }
{ "_id": 2, "compare": 1 }
{ "_id": 3, "compare": 0 }
```

### eq

匹配两个值，如果相等则返回 `true`，否则返回 `false`。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.eq([<value1>, <value2>])
```

#### 示例代码

 假设集合 `price` 有如下记录：  

```typescript
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

求 `value` 等于 50 的记录。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    matched: $.eq(['$value', 50])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "matched": false }
{ "_id": 2, "matched": false }
{ "_id": 3, "matched": true }
```

### gt

匹配两个值，如果前者大于后者则返回 `true`，否则返回 `false`。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.gt([<value1>, <value2>])
```

#### 示例代码

 假设集合 `price` 有如下记录：  

```typescript
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

判断 `value` 是否大于 50。  

```typescript
const $ = db.command.aggregate
db.collection('price').aggregate()
  .project({
    matched: $.gt(['$value', 50])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "matched": false }
{ "_id": 2, "matched": true }
{ "_id": 3, "matched": false }
```

### gte

匹配两个值，如果前者大于或等于后者则返回 `true`，否则返回 `false`。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.gte([<value1>, <value2>])
```

#### 示例代码

 假设集合 `price` 有如下记录：  

```typescript
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

判断 `value` 是否大于或等于 50。  

```typescript
const $ = db.command.aggregate
let res = await b.collection('price').aggregate()
  .project({
    matched: $.gte(['$value', 50])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "matched": false }
{ "_id": 2, "matched": true }
{ "_id": 3, "matched": true }
```

### lt

匹配两个值，如果前者小于后者则返回 `true`，否则返回 `false`。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.lt([<value1>, <value2>])
```

#### 示例代码

 假设集合 `price` 有如下记录：  

```
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

判断 `value` 是否小于 50。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    matched: $.lt(['$value', 50])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "matched": true }
{ "_id": 2, "matched": false }
{ "_id": 3, "matched": false }
```

### lte

匹配两个值，如果前者小于或等于后者则返回 `true`，否则返回 `false`。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.lte([<value1>, <value2>])
```

#### 示例代码

 假设集合 `price` 有如下记录：  

```typescript
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

判断 `value` 是否小于 50。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    matched: $.lte(['$value', 50])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "matched": true }
{ "_id": 2, "matched": false }
{ "_id": 3, "matched": true }
```

### neq

匹配两个值，如果不相等则返回 `true`，否则返回 `false`。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.neq([<value1>, <value2>])
```

#### 示例代码

 假设集合 `price` 有如下记录：  

```typescript
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

求 `value` 不等于 50 的记录。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price').aggregate()
  .project({
    matched: $.neq(['$value', 50])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "matched": true }
{ "_id": 2, "matched": true }
{ "_id": 3, "matched": false }
```

## 条件操作符

### cond

计算布尔表达式，返回指定的两个值其中之一。  

#### API 说明

 `cond` 的使用形式如下：  

```typescript
cond({ if: <布尔表达式>, then: <真值>, else: <假值>  })
```

或者：  

```typescript
cond([ <布尔表达式>, <真值>, <假值> ])
```

两种形式中，三个参数（`if`、`then`、`else`）都是必须的。  

 如果布尔表达式为真，那么 `$cond` 将会返回 `<真值>`，否则会返回 `<假值>`  

#### 示例代码

 假设集合 `items` 的记录如下：  

```typescript
{ "_id": "0", "name": "item-a", "amount": 100 }
{ "_id": "1", "name": "item-b", "amount": 200 }
{ "_id": "2", "name": "item-c", "amount": 300 }
```

我们可以使用 `cond`，根据 `amount` 字段，来生成新的字段 `discount`：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    name: 1,
    discount: $.cond({
        if: $.gte(['$amount', 200]),
        then: 0.7,
        else: 0.9
    })
  })
  .end()
```

输出如下：  

```typescript
{ "_id": "0", "name": "item-a", "discount": 0.9 }
{ "_id": "1", "name": "item-b", "discount": 0.7 }
{ "_id": "2", "name": "item-c", "discount": 0.7 }
```

### ifNull

计算给定的表达式，如果表达式结果为 null、undefined 或者不存在，那么返回一个替代值；否则返回原值。  

#### API 说明

 `ifNull` 的使用形式如下：  

```typescript
ifNull([ <表达式>, <替代值> ])
```

#### 示例代码

 假设集合 `items` 的记录如下：  

```typescript
{ "_id": "0", "name": "A", "description": "这是商品 A" }
{ "_id": "1", "name": "B", "description": null }
{ "_id": "2", "name": "C" }
```

我们可以使用 `ifNull`，对不存在 `desc` 字段的文档，或者 `desc` 字段为 `null` 的文档，补充一个替代值。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    _id: 0,
    name: 1,
    description: $.ifNull(['$description', '商品描述空缺'])
  })
  .end()
```

输出如下：  

```typescript
{ "name": "A", "description": "这是商品 A" }
{ "name": "B", "description": "商品描述空缺" }
{ "name": "C", "description": "商品描述空缺" }
```

### switch

根据给定的 `switch-case-default` 计算返回值、  

#### API 说明

 `switch` 的使用形式如下：  

```typescript
switch({
    branches: [
        case: <表达式>, then: <表达式>,
        case: <表达式>, then: <表达式>,
        ...
    ],
    default: <表达式>
})
```

#### 示例代码

 假设集合 `items` 的记录如下：  

```typescript
{ "_id": "0", "name": "item-a", "amount": 100 }
{ "_id": "1", "name": "item-b", "amount": 200 }
{ "_id": "2", "name": "item-c", "amount": 300 }
```

我们可以使用 `switch`，根据 `amount` 字段，来生成新的字段 `discount`：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    name: 1,
    discount: $.switch({
        branches: [
            { case: $.gt(['$amount', 250]), then: 0.8 },
            { case: $.gt(['$amount', 150]), then: 0.9 }
        ],
        default: 1
    })
  })
  .end()
```

输出如下：  

```typescript
{ "_id": "0", "name": "item-a", "discount": 1 }
{ "_id": "1", "name": "item-b", "discount": 0.9 }
{ "_id": "2", "name": "item-c", "discount": 0.8 }
```

## 日期操作符

**注意**

- 以下日期操作符中`timezone`均支持以下几种形式

```typescript
timezone: "Asia/Shanghai" // Asia/Shanghai时区
timezone: "+08" // utc+8 时区
timezone: "+08:30" // 时区偏移 8 小时 30 分
timezone: "+0830" // 时区偏移 8 小时 30 分，同上
```

### dateFromParts

给定日期的相关信息，构建并返回一个日期对象。  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.dateFromParts({
    year: <year>,
    month: <month>,
    day: <day>,
    hour: <hour>,
    minute: <minute>,
    second: <second>,
    millisecond: <ms>,
    timezone: <tzExpression>
})
```

你也可以使用 ISO 8601 的标准：  

```typescript
db.command.aggregate.dateFromParts({
    isoWeekYear: <year>,
    isoWeek: <week>,
    isoDayOfWeek: <day>,
    hour: <hour>,
    minute: <minute>,
    second: <second>,
    millisecond: <ms>,
    timezone: <tzExpression>
})
```

#### 示例代码

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    date: $.dateFromParts({
        year: 2017,
        month: 2,
        day: 8,
        hour: 12,
        timezone: 'America/New_York'
    }),
  })
  .end()
```

输出如下：  

```typescript
{
    "date": ISODate("2017-02-08T17:00:00.000Z")
}
```

### dateFromString

将一个日期/时间字符串转换为日期对象  

#### API 说明

 语法如下：  

```typescript
db.command.aggregate.dateFromString({
    dateString: <dateStringExpression>,
    timezone: <tzExpression>
})
```

#### 示例代码

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    date: $.dateFromString({
        dateString: "2019-05-14T09:38:51.686Z"
    })
  })
  .end()
```

输出如下：  

```typescript
{
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

### dateToString

根据指定的表达式将日期对象格式化为符合要求的字符串。  

#### API 说明

 `dateToString` 的调用形式如下：  

```typescript
db.command.aggregate.dateToString({
  date: <日期表达式>,
  format: <格式化表达式>,
  timezone: <时区表达式>,
  onNull: <空值表达式>
})
```

下面是四种表达式的详细说明：  

|名称     |描述                                                                                                           |
|----     |----                                                                                                           |
|日期表达式  |必选。指定字段值应该是能转化为字符串的日期。                                                                                       |
|格式化表达式 |可选。它可以是任何包含“格式说明符”的有效字符串。                                                                                    |
|时区表达式  |可选。指明运算结果的时区。它可以解析格式为 [UTC Offset](https://en.wikipedia.org/wiki/List_of_UTC_time_offsets) 或者 [Olson Timezone Identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 的字符串。|
|空值表达式  |可选。当 <日期表达式> 返回空或者不存在的时候，会返回此表达式指明的值。                                                                          |

下面是格式说明符的详细说明：  

|说明符 |描述               |合法值   |
|----  |----               |----    |
|%d   |月份的日期（2 位数，0 填充）    |01 - 31  |
|%G   |ISO 8601 格式的年份       |0000 - 9999|
|%H   |小时（2 位数，0 填充，24 小时制）  |00 - 23  |
|%j   |一年中的一天（3 位数，0 填充）   |001 - 366 |
|%L   |毫秒（3 位数，0 填充）       |000 - 999 |
|%m   |月份（2 位数，0 填充）       |01 - 12  |
|%M   |分钟（2 位数，0 填充）       |00 - 59  |
|%S   |秒（2 位数，0 填充）        |00 - 60  |
|%w   |星期几              |1 - 7   |
|%u   |ISO 8601 格式的星期几      |1 - 7   |
|%U   |一年中的一周（2 位数，0 填充）   |00 - 53  |
|%V   |ISO 8601 格式的一年中的一周   |1 - 53   |
|%Y   |年份（4 位数，0 填充）       |0000 - 9999|
|%z   |与 UTC 的时区偏移量       |+/-[hh][mm]|
|%Z   |以分钟为单位，与 UTC 的时区偏移量|+/-mmm   |
|%%   |百分号作为字符          |%     |

#### 示例代码

 假设集合 `students` 有如下记录：  

```typescript
{ "date": "1999-12-11T16:00:00.000Z", "firstName": "Yuanxin", "lastName": "Dong" }
{ "date": "1998-11-10T16:00:00.000Z", "firstName": "Weijia", "lastName": "Wang" }
{ "date": "1997-10-09T16:00:00.000Z", "firstName": "Chengxi", "lastName": "Li" }
```

**格式化日期**

 下面是将 `date` 字段的值，格式化成形如 `年份-月份-日期` 的字符串：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    formatDate: $.dateToString({
      date: '$date',
      format: '%Y-%m-%d'
    })
  })
  .end()
```

返回的结果如下：  

```typescript
{ "formatDate": "1999-12-11" }
{ "formatDate": "1998-11-10" }
{ "formatDate": "1997-10-09" }
```

**时区时间**

 下面是将 `date` 字段值格式化为上海时区时间的例子：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    formatDate: $.dateToString({
      date: '$date',
      format: '%H:%M:%S',
      timezone: 'Asia/Shanghai'
    })
  })
  .end()
```

返回的结果如下：  

```typescript
{ "formatDate": "00:00:00" }
{ "formatDate": "00:00:00" }
{ "formatDate": "00:00:00" }
```

**缺失情况的默认值**

 当指定的 `<日期表达式>` 返回空或者不存在的时候，可以设置缺失情况下的默认值：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    formatDate: $.dateToString({
      date: '$empty',
      onNull: 'null'
    })
  })
  .end()
```

返回的结果如下：  

```typescript
{ "formatDate": "null" }
{ "formatDate": "null" }
{ "formatDate": "null" }
```

### dayOfMonth

返回日期字段对应的天数（一个月中的哪一天），是一个介于 1 至 31 之间的数字。  

#### API 说明

该接口有以下两种用法，语法如下：  

```typescript
db.command.aggregate.dayOfMonth(<日期字段>)

db.command.aggregate.dayOfMonth({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

 假设集合 `dates` 有以下文档：  

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `dayOfMonth()` 对 `date` 字段进行投影，获取对应的日期：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    dayOfMonth: $.dayOfMonth('$date')
  })
  .end()
```

输出如下：  

```typescript
{
    "dayOfMonth": 14
}
```

### dayOfWeek

返回日期字段对应的天数（一周中的第几天），是一个介于 1（周日）到 7（周六）之间的整数。  

#### API 说明

**注意：周日是每周的第 1 天**  

该接口有以下两种用法，语法如下：  

```typescript
db.command.aggregate.dayOfWeek(<日期字段>)

db.command.aggregate.dayOfWeek({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

 假设集合 `dates` 有以下文档：  

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `dayOfWeek()` 对 `date` 字段进行投影，获取对应的天数（一周中的第几天）：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    dayOfWeek: $.dayOfWeek('$date')
  })
  .end()
```

输出如下：  

```typescript
{
    "dayOfWeek": 3
}
```

### dayOfYear

返回日期字段对应的天数（一年中的第几天），是一个介于 1 到 366 之间的整数。  

#### API 说明

该接口有以下两种用法，语法如下：  
  
```typescript
db.command.aggregate.dayOfYear(<日期字段>)

db.command.aggregate.dayOfYear({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

 假设集合 `dates` 有以下文档：  

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `dayOfYear()` 对 `date` 字段进行投影，获取对应的天数（一年中的第几天）：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    dayOfYear: $.dayOfYear('$date')
  })
  .end()
```

输出如下：  

```typescript
{
    "dayOfYear": 134
}
```

### hour

返回日期字段对应的小时数，是一个介于 0 到 23 之间的整数。  

#### API 说明

该接口有以下两种用法，语法如下：  
  
```typescript
db.command.aggregate.hour(<日期字段>)

db.command.aggregate.hour({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

 假设集合 `dates` 有以下文档：  

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `hour()` 对 `date` 字段进行投影，获取对应的小时数：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    hour: $.hour('$date')
  })
  .end()
```

输出如下：  

```typescript
{
    "hour": 9
}
```

### isoDayOfWeek

返回日期字段对应的 ISO 8601 标准的天数（一周中的第几天），是一个介于 1（周一）到 7（周日）之间的整数。  

#### API 说明

该接口有以下两种用法，语法如下：  
  
```typescript
db.command.aggregate.isoDayOfWeek(<日期字段>)

db.command.aggregate.isoDayOfWeek({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

假设集合 `dates` 有以下文档：

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `isoDayOfWeek()` 对 `date` 字段进行投影，获取对应的 ISO 8601 标准的天数（一周中的第几天）：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    isoDayOfWeek: $.isoDayOfWeek('$date')
  })
  .end()
```

输出如下：

```typescript
{
    "isoDayOfWeek": 2
}
```

### isoWeek

返回日期字段对应的 ISO 8601 标准的周数（一年中的第几周），是一个介于 1 到 53 之间的整数。  

#### API 说明

根据 ISO 8601 标准，周一到周日视为一周，本年度第一个周四所在的那周，视为本年度的第 1 周。  

例如：2016 年 1 月 7 日是那年的第一个周四，那么 2016.01.04（周一）到 2016.01.10（周日）即为第 1 周。同理，2016 年 1 月 1 日的周数为 53。  

该接口有以下两种用法，语法如下：  
  
```typescript
db.command.aggregate.isoWeek(<日期字段>)

db.command.aggregate.isoWeek({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

假设集合 `dates` 有以下文档：  

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `isoWeek()` 对 `date` 字段进行投影，获取对应的 ISO 8601 标准的周数（一年中的第几周）：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    isoWeek: $.isoWeek('$date')
  })
  .end()
```

输出如下：  

```typescript
{
    "isoWeek": 20
}
```

### isoWeekYear

返回日期字段对应的 ISO 8601 标准的天数（一年中的第几天）。  

#### API 说明

此处的“年”以第一周的周一为开始，以最后一周的周日为结束。  

该接口有以下两种用法，语法如下：  
  
```typescript
db.command.aggregate.isoWeekYear(<日期字段>)

db.command.aggregate.isoWeekYear({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

假设集合 `dates` 有以下文档：  

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `isoWeekYear()` 对 `date` 字段进行投影，获取对应的 ISO 8601 标准的天数（一年中的第几天）：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    isoWeekYear: $.isoWeekYear('$date')
  })
  .end()
```

输出如下：  

```typescript
{
    "isoWeekYear": 2019
}
```

### millisecond

返回日期字段对应的毫秒数，是一个介于 0 到 999 之间的整数。  

#### API 说明

该接口有以下两种用法，语法如下：  
  
```typescript
db.command.aggregate.millisecond(<日期字段>)

db.command.aggregate.millisecond({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

假设集合 `dates` 有以下文档：

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `millisecond()` 对 `date` 字段进行投影，获取对应的毫秒数：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    millisecond: $.millisecond('$date'),
  })
  .end()
```

输出如下：  

```typescript
{
    "millisecond": 686
}
```

### minute

返回日期字段对应的分钟数，是一个介于 0 到 59 之间的整数。  

#### API 说明

该接口有以下两种用法，语法如下：  
  
```typescript
db.command.aggregate.minute(<日期字段>)

db.command.aggregate.minute({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

假设集合 `dates` 有以下文档：

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `minute()` 对 `date` 字段进行投影，获取对应的分钟数：

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    minute: $.minute('$date')
  })
  .end()
```

输出如下：  

```typescript
{
    "minute": 38
}
```

### month

返回日期字段对应的月份，是一个介于 1 到 12 之间的整数。  

#### API 说明

该接口有以下两种用法，语法如下：  
  
```typescript
db.command.aggregate.month(<日期字段>)

db.command.aggregate.month({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

 假设集合 `dates` 有以下文档：  

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `month()` 对 `date` 字段进行投影，获取对应的月份：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    month: $.month('$date')
  })
  .end()
```

输出如下：  

```typescript
{
    "month": 5
}
```

### second

返回日期字段对应的秒数，是一个介于 0 到 59 之间的整数，在特殊情况下（闰秒）可能等于 60。  

#### API 说明

该接口有以下两种用法，语法如下：  
  
```typescript
db.command.aggregate.second(<日期字段>)

db.command.aggregate.second({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

假设集合 `dates` 有以下文档：

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `second()` 对 `date` 字段进行投影，获取对应的秒数：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    second: $.second('$date')
  })
  .end()
```

输出如下：  

```typescript
{
    "second": 51
}
```

### week

返回日期字段对应的周数（一年中的第几周），是一个介于 0 到 53 之间的整数。  

#### API 说明

每周以周日为开头，**每年的第一个周日**即为 `week 1` 的开始，这天之前是 `week 0`。  

该接口有以下两种用法，语法如下：  
  
```typescript
db.command.aggregate.week(<日期字段>)

db.command.aggregate.week({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

假设集合 `dates` 有以下文档：  

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `week()` 对 `date` 字段进行投影，获取对应的周数（一年中的第几周）：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    week: $.week('$date')
  })
  .end()
```

输出如下：  

```typescript
{
    "week": 19
}
```

### year

返回日期字段对应的年份。  

#### API 说明

该接口有以下两种用法，语法如下：  
  
```typescript
db.command.aggregate.year(<日期字段>)

db.command.aggregate.year({date:<日期字段>,timezone:<时区>})
```

#### 示例代码

假设集合 `dates` 有以下文档：

```typescript
{
    "_id": 1,
    "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `year()` 对 `date` 字段进行投影，获取对应的年份：

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('dates')
  .aggregate()
  .project({
    _id: 0,
    year: $.year('$date')
  })
  .end()
```

输出如下：

```typescript
{
    "year": 2019
}
```

## 常量操作符

### literal

直接返回一个值的字面量，不经过任何解析和处理。  

#### API 说明

 `literal` 使用形式如下：  

```typescript
literal(<值>)
```

如果 `<值>` 是一个表达式，那么 `literal` **不会**解析或者计算这个表达式，而是直接返回这个表达式。  

#### 示例代码

 比如我们有一个 `items` 集合，其中数据如下：  

```typescript
{ "_id": "0", "price": "$1" }
{ "_id": "1", "price": "$5.60" }
{ "_id": "2", "price": "$8.90" }
```

**以字面量的形式使用 $**

 下面的代码使用 `literal`，生成了一个新的字段 `isOneDollar`，表示 `price` 字段是否严格等于 `"$1"`。  

 注意：我们这里无法使用 `eq(['$price', '$1'])`，因为 `"$1"` 是一个表达式，代表 `"1"` 字段对应的值，而不是字符串字面量 `"$1"`。  

```typescript
const $ = db.command.aggregate
let res = await db.collection('items').aggregate()
  .project({
    isOneDollar: $.eq(['$price', $.literal('$1')])
  })
  .end()
```

输出如下：  

```typescript
{ "_id": "0", "isOneDollar": true }
{ "_id": "1", "isOneDollar": false }
{ "_id": "2", "isOneDollar": false }
```

**投影一个字段，对应的值为 1**

 下面的代码使用 `literal`，投影了一个新的字段 `amount`，其值为 `1`。  

```typescript
const $ = db.command.aggregate
db.collection('items').aggregate()
  .project({
    price: 1,
    amount: $.literal(1)
  })
  .end()
```

输出如下：  

```typescript
{ "_id": "0", "price": "$1", "amount": 1 }
{ "_id": "1", "price": "$5.60", "amount": 1 }
{ "_id": "2", "price": "$8.90", "amount": 1 }
```

## 对象操作符

### mergeObjects

将多个文档合并为单个文档。  

#### API 说明

 使用形式如下：
在 `group()` 中使用时：  

```typescript
mergeObjects(<document>)
```

在其它表达式中使用时：  

```typescript
mergeObjects([<document1>, <document2>, ...])
```

#### 示例代码

**搭配 `group()` 使用**

 假设集合 `sales` 存在以下文档：  

```typescript
{ "_id": 1, "year": 2018, "name": "A", "volume": { "2018Q1": 500, "2018Q2": 500 } }
{ "_id": 2, "year": 2017, "name": "A", "volume": { "2017Q1": 400, "2017Q2": 300, "2017Q3": 0, "2017Q4": 0 } }
{ "_id": 3, "year": 2018, "name": "B", "volume": { "2018Q1": 100 } }
{ "_id": 4, "year": 2017, "name": "B", "volume": { "2017Q3": 100, "2017Q4": 250 } }
```

下面的代码使用 `mergeObjects()`，将用相同 `name` 的文档合并：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('sales').aggregate()
  .group({
    _id: '$name',
    mergedVolume: $.mergeObjects('$volume')
  })
  .end()
```

输出如下：  

```typescript
{ "_id": "A", "mergedVolume": { "2017Q1": 400, "2017Q2": 300, "2017Q3": 0, "2017Q4": 0, "2018Q1": 500, "2018Q2": 500 } }
{ "_id": "B", "mergedVolume": { "2017Q3": 100, "2017Q4": 250, "2018Q1": 100 } }
```

**一般用法**

假设集合 `test` 存在以下文档：  

```typescript
{ "_id": 1, "foo": { "a": 1 }, "bar": { "b": 2 } }
{ "_id": 2, "foo": { "c": 1 }, "bar": { "d": 2 } }
{ "_id": 3, "foo": { "e": 1 }, "bar": { "f": 2 } }
```

下面的代码使用 `mergeObjects()`，将文档中的 `foo` 和 `bar` 字段合并为 `foobar`：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('sales').aggregate()
  .project({
    foobar: $.mergeObjects(['$foo', '$bar'])
  })
  .end()
```

输出结果如下：  

```typescript
{ "_id": 1, "foobar": { "a": 1, "b": 2 } }
{ "_id": 2, "foobar": { "c": 1, "d": 2 } }
{ "_id": 3, "foobar": { "e": 1, "f": 2 } }
```

## 集合操作符

### allElementsTrue

输入一个数组，或者数组字段的表达式。如果数组中所有元素均为真值，那么返回 `true`，否则返回 `false`。空数组永远返回 `true`。  

#### API 说明

语法如下：

```typescript
allElementsTrue([<expression>])
```

#### 示例代码

假设集合 `test` 有如下记录：  

```typescript
{ "_id": 1, "array": [ true ] }
{ "_id": 2, "array": [ ] }
{ "_id": 3, "array": [ false ] }
{ "_id": 4, "array": [ true, false ] }
{ "_id": 5, "array": [ 0 ] }
{ "_id": 6, "array": [ "stark" ] }
```

下面的代码使用 `allElementsTrue()`，判断 `array` 字段中是否均为真值：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price')
  .aggregate()
  .project({
    isAllTrue: $.allElementsTrue(['$array'])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "isAllTrue": true }
{ "_id": 2, "isAllTrue": true }
{ "_id": 3, "isAllTrue": false }
{ "_id": 4, "isAllTrue": false }
{ "_id": 5, "isAllTrue": false }
{ "_id": 6, "isAllTrue": true }
```

### anyElementTrue

输入一个数组，或者数组字段的表达式。如果数组中任意一个元素为真值，那么返回 `true`，否则返回 `false`。空数组永远返回 `false`。  

#### API 说明

 语法如下：  

```typescript
anyElementTrue([<expression>])
```

#### 示例代码

 假设集合 `test` 有如下记录：  

```typescript
{ "_id": 1, "array": [ true ] }
{ "_id": 2, "array": [ ] }
{ "_id": 3, "array": [ false ] }
{ "_id": 4, "array": [ true, false ] }
{ "_id": 5, "array": [ 0 ] }
{ "_id": 6, "array": [ "stark" ] }
```

下面的代码使用 `anyElementTrue()`，判断 `array` 字段中是否含有真值：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('price')
  .aggregate()
  .project({
    isAnyTrue: $.anyElementTrue(['$array'])
  })
  .end()
```

返回结果如下：  

```typescript
{ "_id": 1, "isAnyTrue": true }
{ "_id": 2, "isAnyTrue": false }
{ "_id": 3, "isAnyTrue": false }
{ "_id": 4, "isAnyTrue": true }
{ "_id": 5, "isAnyTrue": false }
{ "_id": 6, "isAnyTrue": true }
```

### setDifference

输入两个集合，输出只存在于第一个集合中的元素。  

#### API 说明

 使用形式如下：  

```typescript
setDifference([<expression1>, <expression2>])
```

#### 示例代码

 假设集合 `test` 存在以下数据：  

```typescript
{ "_id": 1, "A": [ 1, 2 ], "B": [ 1, 2 ] }
{ "_id": 2, "A": [ 1, 2 ], "B": [ 2, 1, 2 ] }
{ "_id": 3, "A": [ 1, 2 ], "B": [ 1, 2, 3 ] }
{ "_id": 4, "A": [ 1, 2 ], "B": [ 3, 1 ] }
{ "_id": 5, "A": [ 1, 2 ], "B": [ ] }
{ "_id": 6, "A": [ 1, 2 ], "B": [ {}, [] ] }
{ "_id": 7, "A": [ ], "B": [ ] }
{ "_id": 8, "A": [ ], "B": [ 1 ] }
```

下面的代码使用 `setDifference`，找到只存在于 `B` 中的数字：  

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    isBOnly: $.setDifference(['$B', '$A'])
  })
  .end()
```

```typescript
{ "_id": 1, "isBOnly": [] }
{ "_id": 2, "isBOnly": [] }
{ "_id": 3, "isBOnly": [3] }
{ "_id": 4, "isBOnly": [3] }
{ "_id": 5, "isBOnly": [] }
{ "_id": 6, "isBOnly": [{}, []] }
{ "_id": 7, "isBOnly": [] }
{ "_id": 8, "isBOnly": [1] }
```

### setEquals

输入两个集合，判断两个集合中包含的元素是否相同（不考虑顺序、去重）。  

#### API 说明

 使用形式如下：  

```typescript
setEquals([<expression1>, <expression2>])
```

#### 示例代码

 假设集合 `test` 存在以下数据：  

```typescript
{ "_id": 1, "A": [ 1, 2 ], "B": [ 1, 2 ] }
{ "_id": 2, "A": [ 1, 2 ], "B": [ 2, 1, 2 ] }
{ "_id": 3, "A": [ 1, 2 ], "B": [ 1, 2, 3 ] }
{ "_id": 4, "A": [ 1, 2 ], "B": [ 3, 1 ] }
{ "_id": 5, "A": [ 1, 2 ], "B": [ ] }
{ "_id": 6, "A": [ 1, 2 ], "B": [ {}, [] ] }
{ "_id": 7, "A": [ ], "B": [ ] }
{ "_id": 8, "A": [ ], "B": [ 1 ] }
```

下面的代码使用 `setEquals`，判断两个集合中包含的元素是否相同：  

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    sameElements: $.setEquals(['$A', '$B'])
  })
  .end()
```

```typescript
{ "_id": 1, "sameElements": true }
{ "_id": 2, "sameElements": true }
{ "_id": 3, "sameElements": false }
{ "_id": 4, "sameElements": false }
{ "_id": 5, "sameElements": false }
{ "_id": 6, "sameElements": false }
{ "_id": 7, "sameElements": true }
{ "_id": 8, "sameElements": false }
```

### setIntersection

输入两个集合，输出两个集合的交集。  

#### API 说明

 使用形式如下：  

```typescript
setIntersection([<expression1>, <expression2>])
```

#### 示例代码

 假设集合 `test` 存在以下数据：  

```typescript
{ "_id": 1, "A": [ 1, 2 ], "B": [ 1, 2 ] }
{ "_id": 2, "A": [ 1, 2 ], "B": [ 2, 1, 2 ] }
{ "_id": 3, "A": [ 1, 2 ], "B": [ 1, 2, 3 ] }
{ "_id": 4, "A": [ 1, 2 ], "B": [ 3, 1 ] }
{ "_id": 5, "A": [ 1, 2 ], "B": [ ] }
{ "_id": 6, "A": [ 1, 2 ], "B": [ {}, [] ] }
{ "_id": 7, "A": [ ], "B": [ ] }
{ "_id": 8, "A": [ ], "B": [ 1 ] }
```

下面的代码使用 `setIntersection`，输出两个集合的交集：  

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    commonToBoth: $.setIntersection(['$A', '$B'])
  })
  .end()
```

输出如下：  

```typescript
{ "_id": 1, "commonToBoth": [ 1, 2 ] }
{ "_id": 2, "commonToBoth": [ 1, 2 ] }
{ "_id": 3, "commonToBoth": [ 1, 2 ] }
{ "_id": 4, "commonToBoth": [ 1 ] }
{ "_id": 5, "commonToBoth": [ ] }
{ "_id": 6, "commonToBoth": [ ] }
{ "_id": 7, "commonToBoth": [ ] }
{ "_id": 8, "commonToBoth": [ ] }
```

### setIsSubset

输入两个集合，判断第一个集合是否是第二个集合的子集。  

#### API 说明

 使用形式如下：  

```typescript
setIsSubset([<expression1>, <expression2>])
```

#### 示例代码

 假设集合 `test` 存在以下数据：  

```typescript
{ "_id": 1, "A": [ 1, 2 ], "B": [ 1, 2 ] }
{ "_id": 2, "A": [ 1, 2 ], "B": [ 2, 1, 2 ] }
{ "_id": 3, "A": [ 1, 2 ], "B": [ 1, 2, 3 ] }
{ "_id": 4, "A": [ 1, 2 ], "B": [ 3, 1 ] }
{ "_id": 5, "A": [ 1, 2 ], "B": [ ] }
{ "_id": 6, "A": [ 1, 2 ], "B": [ {}, [] ] }
{ "_id": 7, "A": [ ], "B": [ ] }
{ "_id": 8, "A": [ ], "B": [ 1 ] }
```

下面的代码使用 `setIsSubset`，判断第一个集合是否是第二个集合的子集：  

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    AisSubsetOfB: $.setIsSubset(['$A', '$B'])
  })
  .end()
```

```typescript
{ "_id": 1, "AisSubsetOfB": true }
{ "_id": 2, "AisSubsetOfB": true }
{ "_id": 3, "AisSubsetOfB": true }
{ "_id": 4, "AisSubsetOfB": false }
{ "_id": 5, "AisSubsetOfB": false }
{ "_id": 6, "AisSubsetOfB": false }
{ "_id": 7, "AisSubsetOfB": true }
{ "_id": 8, "AisSubsetOfB": true }
```

### setUnion

输入两个集合，输出两个集合的并集。  

#### API 说明

 使用形式如下：  

```typescript
setUnion([<expression1>, <expression2>])
```

#### 示例代码

 假设集合 `test` 存在以下数据：  

```typescript
{ "_id": 1, "A": [ 1, 2 ], "B": [ 1, 2 ] }
{ "_id": 2, "A": [ 1, 2 ], "B": [ 2, 1, 2 ] }
{ "_id": 3, "A": [ 1, 2 ], "B": [ 1, 2, 3 ] }
{ "_id": 4, "A": [ 1, 2 ], "B": [ 3, 1 ] }
{ "_id": 5, "A": [ 1, 2 ], "B": [ ] }
{ "_id": 6, "A": [ 1, 2 ], "B": [ {}, [] ] }
{ "_id": 7, "A": [ ], "B": [ ] }
{ "_id": 8, "A": [ ], "B": [ 1 ] }
```

下面的代码使用 `setUnion`，输出两个集合的并集：  

```typescript
let res = await db.collection('test')
  .aggregate()
  .project({
    AB: $.setUnion(['$A', '$B'])
  })
  .end()
```

输出如下：  

```typescript
{ "_id": 1, "AB": [ 1, 2 ] }
{ "_id": 2, "AB": [ 1, 2 ] }
{ "_id": 3, "AB": [ 1, 2, 3 ] }
{ "_id": 4, "AB": [ 1, 2, 3 ] }
{ "_id": 5, "AB": [ 1, 2 ] }
{ "_id": 6, "AB": [ 1, 2, {}, [] ] }
{ "_id": 7, "AB": [ ] }
{ "_id": 8, "AB": [ 1 ] }
```

## 字符串操作符

### concat

连接字符串，返回拼接后的字符串。  

#### API 说明

 `concat` 的语法如下：  

```typescript
db.command.aggregate.concat([<表达式1>, <表达式2>, ...])
```

表达式可以是形如 `$ + 指定字段`，也可以是普通字符串。只要能够被解析成字符串即可。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `concat` 可以拼接 `lastName` 和 `firstName` 字段，得到每位学生的名字全称：  

```typescript
const $ = db.command.aggregate
db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    fullName: $.concat(['$firstName', ' ', '$lastName'])
  })
  .end()
```

返回的结果如下：  

```typescript
{ "fullName": "Yuanxin Dong" }
{ "fullName": "Weijia Wang" }
{ "fullName": "Chengxi Li" }
```

### indexOfBytes

在目标字符串中查找子字符串，并返回第一次出现的 `UTF-8` 的字节索引（从 0 开始）。如果不存在子字符串，返回 -1。  

#### API 说明

 `indexOfBytes` 的语法如下：  

```typescript
db.command.aggregate.indexOfBytes([<目标字符串表达式>, <子字符串表达式>, <开始位置表达式>, <结束位置表达式>])
```

下面是 4 种表达式的详细描述：  

|表达式      |描述               |
|----       |----               |
|目标字符串表达式 |任何可以被解析为字符串的表达式  |
|子字符串表达式  |任何可以被解析为字符串的表达式  |
|开始位置表达式  |任何可以被解析为非负整数的表达式 |
|结束位置表达式  |任何可以被解析为非负整数的表达式 |

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `indexOfBytes` 查找字符 `"a"` 在字段 `firstName` 中的位置：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    aStrIndex: $.indexOfBytes(['$firstName', 'a'])
  })
  .end()
```

返回的结果如下：  

```typescript
{ "aStrIndex": 2 }
{ "aStrIndex": 5 }
{ "aStrIndex": -1 }
```

### indexOfCP

在目标字符串中查找子字符串，并返回第一次出现的 `UTF-8` 的 `code point` 索引（从 0 开始）。如果不存在子字符串，返回 -1。  

#### API 说明

 `code point` 是“码位”，又名“编码位置”。这里特指 `Unicode` 包中的码位，范围是从 0（16 进制）到 10FFFF（16 进制）。  

 `indexOfCP` 的语法如下：  

```typescript
db.command.aggregate.indexOfCP([<目标字符串表达式>, <子字符串表达式>, <开始位置表达式>, <结束位置表达式>])
```

下面是 4 种表达式的详细描述：  

|表达式      |描述               |
|----       |----               |
|目标字符串表达式 |任何可以被解析为字符串的表达式  |
|子字符串表达式  |任何可以被解析为字符串的表达式  |
|开始位置表达式  |任何可以被解析为非负整数的表达式 |
|结束位置表达式  |任何可以被解析为非负整数的表达式 |

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `indexOfCP` 查找字符 `"a"` 在字段 `firstName` 中的位置：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    aStrIndex: $.indexOfCP(['$firstName', 'a'])
  })
  .end()
```

返回的结果如下：  

```typescript
{ "aStrIndex": 2 }
{ "aStrIndex": 5 }
{ "aStrIndex": -1 }
```

### split

按照分隔符分隔数组，并且删除分隔符，返回子字符串组成的数组。如果字符串无法找到分隔符进行分隔，返回原字符串作为数组的唯一元素。  

#### API 说明

 `split` 的语法如下：  

```typescript
db.command.aggregate.split([<字符串表达式>, <分隔符表达式>])
```

字符串表达式和分隔符表达式可以是任意形式的表达式，只要它可以被解析为字符串即可。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "birthday": "1999/12/12" }
{ "birthday": "1998/11/11" }
{ "birthday": "1997/10/10" }
```

通过 `split` 将每条记录中的 `birthday` 字段对应值分隔成数组，每个数组分别由代表年、月、日的 3 个元素组成：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    birthday: $.split(['$birthday', '/'])
  })
  .end()
```

返回的结果如下：  

```typescript
{ "birthday": [ "1999", "12", "12" ] }
{ "birthday": [ "1998", "11", "11" ] }
{ "birthday": [ "1997", "10", "10" ] }
```

### strLenBytes

计算并返回指定字符串中 `utf-8` 编码的字节数量。  

#### API 说明

 `strLenBytes` 的语法如下：  

```typescript
db.command.aggregate.strLenBytes(<表达式>)
```

只要表达式可以被解析成字符串，那么它就是有效表达式。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "name": "dongyuanxin", "nickname": "心谭" }
```

借助 `strLenBytes` 计算 `name` 字段和 `nickname` 字段对应值的字节长度：  

```typescript
const $ = db.command.aggregate
db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    nameLength: $.strLenBytes('$name'),
    nicknameLength: $.strLenBytes('$nickname')
  })
  .end()
```

返回结果如下：  

```typescript
{ "nameLength": 11, "nicknameLength": 6 }
```

### strLenCP

计算并返回指定字符串的 UTF-8 [code points<span></span>](http://www.unicode.org/glossary/#code_point) 数量。  

#### API 说明

 `strLenCP` 的语法如下：  

```typescript
db.command.aggregate.strLenCP(<表达式>)
```

只要表达式可以被解析成字符串，那么它就是有效表达式。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "name": "dongyuanxin", "nickname": "心谭" }
```

借助 `strLenCP` 计算 `name` 字段和 `nickname` 字段对应值的 UTF-8 [code points<span></span>](http://www.unicode.org/glossary/#code_point)的数量：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    nameLength: $.strLenCP('$name'),
    nicknameLength: $.strLenCP('$nickname')
  })
  .end()
```

返回结果如下：  

```typescript
{ "nameLength": 11, "nicknameLength": 2 }
```

### strcasecmp

对两个字符串在不区分大小写的情况下进行大小比较，并返回比较的结果。  

#### API 说明

 `strcasecmp` 的语法如下：  

```typescript
db.command.aggregate.strcasecmp([<表达式1>, <表达式2>])
```

只要 `表达式1`和 `表达式2` 可以被解析成字符串，那么它们就是有效的。  

 返回的比较结果有 1，0 和 -1 三种：  

- 1：`表达式1` 解析的字符串 > `表达式2` 解析的字符串 - 0：`表达式1` 解析的字符串 = `表达式2` 解析的字符串 - -1：`表达式1` 解析的字符串 < `表达式2` 解析的字符串

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `strcasecmp` 比较 `firstName` 字段值和 `lastName` 字段值的大小：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    result: $.strcasecmp(['$firstName', '$lastName']),
  })
  .end()
```

返回结果如下：  

```typescript
{ "result": 1 }
{ "result": 1 }
{ "result": -1 }
```

### substr

返回字符串从指定位置开始的指定长度的子字符串。它是 `db.command.aggregate.substrBytes` 的别名，更推荐使用后者。  

#### API 说明

 `substr` 的语法如下：  

```typescript
db.command.aggregate.substr([<表达式1>, <表达式2>, <表达式3>])
```

`表达式1` 是任何可以解析为字符串的有效表达式，`表达式2` 和 `表达式3` 是任何可以解析为数字的有效表达式。  

 如果 `表达式2` 是负数，返回的结果为 `""`。  

 如果 `表达式3` 是负数，返回的结果为从 `表达式2` 指定的开始位置以及之后其余部分的子字符串。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "birthday": "1999/12/12", "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "birthday": "1998/11/11", "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "birthday": "1997/10/10", "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `substr` 可以提取 `birthday` 中的年、月、日信息，代码如下：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    year: $.substr(['$birthday', 0, 4]),
    month: $.substr(['$birthday', 5, 2]),
    day: $.substr(['$birthday', 8, -1])
  })
  .end()
```

返回的结果如下：  

```typescript
{ "day": "12", "month": "12", "year": "1999" }
{ "day": "11", "month": "11", "year": "1998" }
{ "day": "10", "month": "10", "year": "1997" }
```

### substrBytes

返回字符串从指定位置开始的指定长度的子字符串。子字符串是由字符串中指定的 `UTF-8` 字节索引的字符开始，长度为指定的字节数。  

#### API 说明

 `substrBytes` 的语法如下：  

```typescript
db.command.aggregate.substrBytes([<表达式1>, <表达式2>, <表达式3>])
```

`表达式1` 是任何可以解析为字符串的有效表达式，`表达式2` 和 `表达式3` 是任何可以解析为数字的有效表达式。  

 如果 `表达式2` 是负数，返回的结果为 `""`。  

 如果 `表达式3` 是负数，返回的结果为从 `表达式2` 指定的开始位置以及之后其余部分的子字符串。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "birthday": "1999/12/12", "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "birthday": "1998/11/11", "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "birthday": "1997/10/10", "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `substrBytes` 可以提取 `birthday` 中的年、月、日信息，代码如下：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    year: $.substrBytes(['$birthday', 0, 4]),
    month: $.substrBytes(['$birthday', 5, 2]),
    day: $.substrBytes(['$birthday', 8, -1])
  })
  .end()
```

返回的结果如下：  

```typescript
{ "day": "12", "month": "12", "year": "1999" }
{ "day": "11", "month": "11", "year": "1998" }
{ "day": "10", "month": "10", "year": "1997" }
```

### substrCP

返回字符串从指定位置开始的指定长度的子字符串。子字符串是由字符串中指定的 `UTF-8` 字节索引的字符开始，长度为指定的字节数。  

#### API 说明

 `substrCP` 的语法如下：  

```typescript
db.command.aggregate.substrCP([<表达式1>, <表达式2>, <表达式3>])
```

`表达式1` 是任何可以解析为字符串的有效表达式，`表达式2` 和 `表达式3` 是任何可以解析为数字的有效表达式。  

 如果 `表达式2` 是负数，返回的结果为 `""`。  

 如果 `表达式3` 是负数，返回的结果为从 `表达式2` 指定的开始位置以及之后其余部分的子字符串。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "name": "dongyuanxin", "nickname": "心谭" }
```

借助 `substrCP` 可以提取 `nickname` 字段值的第一个汉字：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    firstCh: $.substrCP(['$nickname', 0, 1])
  })
  .end()
```

返回的结果如下：  

```typescript
{ "firstCh": "心" }
```

### toLower

将字符串转化为小写并返回。  

#### API 说明

 `toLower` 的语法如下：  

```typescript
db.command.aggregate.toLower(表达式)
```

只要表达式可以被解析成字符串，那么它就是有效表达式。例如：`$ + 指定字段`。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `toLower` 将 `firstName` 的字段值转化为小写：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    result: $.toLower('$firstName'),
  })
  .end()
```

返回的结果如下：  

```typescript
{ "result": "yuanxin" }
{ "result": "weijia" }
{ "result": "chengxi" }
```

### toUpper

将字符串转化为大写并返回。  

#### API 说明

 `toUpper` 的语法如下：  

```typescript
db.command.aggregate.toUpper(表达式)
```

只要表达式可以被解析成字符串，那么它就是有效表达式。例如：`$ + 指定字段`。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `toUpper` 将 `lastName` 的字段值转化为大写：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .project({
    _id: 0,
    result: $.toUpper('$lastName'),
  })
  .end()
```

返回的结果如下：  

```typescript
{ "result": "DONG" }
{ "result": "WANG" }
{ "result": "LI" }
```

## 分组运算方法

### addToSet

聚合运算符。向数组中添加值，如果数组中已存在该值，不执行任何操作。它只能在 `group stage` 中使用。  

#### API 说明

`addToSet` 语法如下：  

```typescript
db.command.aggregate.addToSet(<表达式>)
```

表达式是形如 `$ + 指定字段` 的字符串。如果指定字段的值是数组，那么整个数组会被当作一个元素。  

#### 示例代码

假设集合 `passages` 的记录如下：  

```typescript
{ "category": "web", "tags": [ "JavaScript", "CSS" ], "title": "title1" }
{ "category": "System", "tags": [ "C++", "C" ], "title": "title2" }
```

**非数组字段**

 每条记录的 `category` 对应值的类型是非数组，利用 `addToSet` 统计所有分类：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('passages')
  .aggregate()
  .group({
    _id: null,
    categories: $.addToSet('$category')
  })
  .end()
```

返回的结果如下：  

```typescript
{ "_id": null, "categories": [ "System", "web" ] }
```

**数组字段**

 每条记录的 `tags` 对应值的类型是数组，数组不会被自动展开：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('passages')
  .aggregate()
  .group({
    _id: null,
    tagsList: $.addToSet('$tags')
  })
  .end()
```

返回的结果如下：  

```typescript
{ "_id": null, "tagsList": [ [ "C++", "C" ], [ "JavaScript", "CSS" ] ] }
```

### avg

<!--
/// meta
keyword: 均值
-->

返回一组集合中，指定字段对应数据的平均值。  

#### API 说明

 `avg` 的语法如下：  

```typescript
db.command.aggregate.avg(<number>)
```

`avg` 传入的值除了数字常量外，也可以是任何最终解析成一个数字的表达式。它会忽略非数字值。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

借助 `avg` 可以计算所有记录的 `score` 的平均值：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .group({
    _id: null,
    average: $.avg('$score')
  })
  .end()
```

返回的结果如下：  

```typescript
{ "_id": null, "average": 90 }
```

### first

返回指定字段在一组集合的第一条记录对应的值。仅当这组集合是按照某种定义排序（ `sort` ）后，此操作才有意义。  

#### API 说明

 `first` 的语法如下：  

```typescript
db.command.aggregate.first(<表达式>)
```

表达式是形如 `$ + 指定字段` 的字符串。  

 `first` 只能在 `group` 阶段被使用，并且需要配合 `sort` 才有意义。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

如果需要得到所有记录中 `score` 的最小值，可以先将所有记录按照 `score` 排序，然后取出第一条记录的 `first`。  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .sort({
    score: 1
  })
  .group({
    _id: null,
    min: $.first('$score')
  })
  .end()
```

返回的数据结果如下：  

```typescript
{ "_id": null, "min": 80 }
```

### last

返回指定字段在一组集合的最后一条记录对应的值。仅当这组集合是按照某种定义排序（ `sort` ）后，此操作才有意义。  

#### API 说明

 `last` 的语法如下：  

```typescript
db.command.aggregate.last(<表达式>)
```

表达式是形如 `$ + 指定字段` 的字符串。  

 `last` 只能在 `group` 阶段被使用，并且需要配合 `sort` 才有意义。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

如果需要得到所有记录中 `score` 的最大值，可以先将所有记录按照 `score` 排序，然后取出最后一条记录的 `last`。  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .sort({
    score: 1
  })
  .group({
    _id: null,
    max: $.last('$score')
  })
  .end()
```

返回的数据结果如下：  

```typescript
{ "_id": null, "max": 100 }
```

### max

返回一组数值的最大值。  

#### API 说明

 `max` 的语法如下：  

```typescript
db.command.aggregate.max(<表达式>)
```

表达式是形如 `$ + 指定字段` 的字符串。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

借助 `max` 可以统计不同组（ `group` ）中成绩的最高值，代码如下：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .group({
    _id: '$group',
    maxScore: $.max('$score')
  })
  .end()
```

返回的数据结果如下：  

```typescript
{ "_id": "b", "maxScore": 100 }
{ "_id": "a", "maxScore": 96 }
...
```

### min

返回一组数值的最小值。  

#### API 说明

 `min` 的语法如下：  

```typescript
db.command.aggregate.min(<表达式>)
```

表达式是形如 `$ + 指定字段` 的字符串。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

借助 `min` 可以统计不同组（ `group` ）中成绩的最低值，代码如下：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .group({
    _id: '$group',
    minScore: $.min('$score')
  })
  .end()
```

返回的数据结果如下：  

```typescript
{ "_id": "b", "minScore": 80 }
{ "_id": "a", "minScore": 84 }
```

### push

在 `group` 阶段，返回一组中表达式指定列与对应的值，一起组成的数组。  

#### API 说明

 `push` 语法如下：  

```typescript
db.command.aggregate.push({
  <字段名1>: <指定字段1>,
  <字段名2>: <指定字段2>,
  ...
})
```

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

借助 `push` 操作，对不同分组 ( `group` ) 的所有记录，聚合所有数据并且将其放入一个新的字段中，进一步结构化和语义化数据。  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('students')
  .aggregate()
  .group({
    _id: '$group',
    students: $.push({
      name: '$name',
      score: '$score'
    })
  })
  .end()
```

输出结果如下：  

```typescript
{ "_id": "b", "students": [{ "name": "stu3", "score": 80 }, { "name": "stu4", "score": 100 }] }
{ "_id": "a", "students": [{ "name": "stu1", "score": 84 }, { "name": "stu2", "score": 96 }] }
```

### stdDevPop

返回一组字段对应值的标准差。  

#### API 说明

 `stdDevPop` 的使用形式如下：  

```typescript
db.command.aggregate.stdDevPop(<表达式>)
```

表达式传入的是指定字段，指定字段对应的值的数据类型必须是 `number` ，否则结果会返回 `null`。  

#### 示例代码

 假设集合 `students` 的记录如下：`a` 组同学的成绩分别是 84 和 96，`b`组同学的成绩分别是 80 和 100。  

```typescript
{ "group":"a", "score":84 }
{ "group":"a", "score":96 }
{ "group":"b", "score":80 }
{ "group":"b", "score":100 }
```

可以用 `stdDevPop` 来分别计算 `a` 和 `b` 两组同学成绩的标准差，以此来比较哪一组同学的成绩更稳定。代码如下：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('students').aggregate()
  .group({
    _id: '$group',
    stdDev: $.stdDevPop('$score')
  })
  .end()
```

返回的数据结果如下：  

```typescript
{ "_id": "b", "stdDev": 10 }
{ "_id": "a", "stdDev": 6 }
```

### stdDevSamp

计算输入值的样本标准偏差。如果输入值代表数据总体，或者不概括更多的数据，请改用 `db.command.aggregate.stdDevPop`。  

#### API 说明

 `stdDevSamp` 的使用形式如下：  

```typescript
db.command.aggregate.stdDevSamp(<表达式>)
```

表达式传入的是指定字段，`stdDevSamp` 会自动忽略非数字值。如果指定字段所有的值均是非数字，那么结果返回 `null`。  

#### 示例代码

 假设集合 `students` 的记录如下：  

```typescript
{ "score": 80 }
{ "score": 100 }
```

可以用 `stdDevSamp` 来计算成绩的标准样本偏差。代码如下：  

```typescript
const $ = db.command.aggregate
let res = await db.collection('students').aggregate()
  .group({
    _id: null,
    ageStdDev: $.stdDevSamp('$score')
  })
  .end()
```

返回的数据结果如下：  

```typescript
{ "_id": null, "ageStdDev": 14.142135623730951 }
```

如果向集合 `students` 添加一条新记录，它的 `score` 字段类型是 `string`：  

```typescript
{ "score": "aa" }
```

用上面代码计算标准样本偏差时，`stdDevSamp` 会自动忽略类型不为 `number` 的记录，返回结果保持不变。

### sum

<!--
/// meta
keyword: 求和
-->

计算并且返回一组字段所有数值的总和。  

#### API 说明

 `sum` 的使用形式如下：  

```typescript
db.command.aggregate.sum(<表达式>)
```

表达式可以传入指定字段，也可以传入指定字段组成的列表。`sum` 会自动忽略非数字值。如果字段下的所有值均是非数字，那么结果返回 0。若传入数字常量，则当做所有记录该字段的值都给给定常量，在聚合时相加，最终值为输入记录数乘以常量。  

#### 示例代码

 假设代表商品的集合 `goods` 的记录如下：`price` 代表商品销售额，`cost` 代表商品成本  

```typescript
{ "cost": -10, "price": 100 }
{ "cost": -15, "price": 1 }
{ "cost": -10, "price": 10 }
```

**单独字段**

 借助 `sum` 可以计算所有商品的销售总和，代码如下：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('goods')
  .aggregate()
  .group({
    _id: null,
    totalPrice: $.sum('$price')
  })
  .end()
```

返回的数据结果如下：销售额是 111  

```typescript
{ "_id": null, "totalPrice": 111 }
```

**字段列表**

 如果需要计算所有商品的利润总额，那么需要将每条记录的 `cost` 和 `price` 相加得到此记录对应商品的利润。最后再计算所有商品的利润总额。  

 借助 `sum`，代码如下：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('goods')
  .aggregate()
  .group({
    _id: null,
    totalProfit: $.sum(
      $.sum(['$price', '$cost'])
    )
  })
  .end()
```

返回的数据结果如下：利润总额为 76  

```typescript
{ "_id": null, "totalProfit": 76 }
```

## 变量操作符

### let

自定义变量，并且在指定表达式中使用，返回的结果是表达式的结果。  

#### API 说明

 `let` 的语法如下：  

```typescript
db.command.aggregate.let({
  vars: {
    <变量1>: <变量表达式>,
    <变量2>: <变量表达式>,
    ...
  },
  in: <结果表达式>
})
```

`vars` 中可以定义多个变量，变量的值由 `变量表达式` 计算而来，并且被定义的变量只有在 `in` 中的 `结果表达式` 才可以访问。  

 在 `in` 的结果表达式中访问自定义变量时候，请在变量名前加上双美元符号 ( `$$` ) 并用引号括起来。  

#### 示例代码

 假设代表商品的集合 `goods` 的记录如下：`price` 代表商品价格，`discount` 代表商品折扣率，`cost` 代表商品成本  

```typescript
{ "cost": -10, "discount": 0.95, "price": 100 }
{ "cost": -15, "discount": 0.98, "price": 1 }
{ "cost": -10, "discount": 1, "price": 10 }
```

借助 `let` 可以定义并计算每件商品实际的销售价格，并将其赋值给自定义变量 `priceTotal`。最后再将 `priceTotal` 与 `cost` 进行取和 ( `sum` ) 运算，得到每件商品的利润。  

 代码如下：  

```typescript
const $ = db.command.aggregate
let res = await db
  .collection('goods')
  .aggregate()
  .project({
    profit: $.let({
      vars: {
        priceTotal: $.multiply(['$price', '$discount'])
      },
      in: $.sum(['$$priceTotal', '$cost'])
    })
  })
  .end()
```

返回的数据结果如下：  

```
{ "profit": 85 }
{ "profit": -14.02 }
{ "profit": 0 }
```
