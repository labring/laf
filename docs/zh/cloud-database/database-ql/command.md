---
title: 数据库操作符
---

# 数据库操作符

Laf 云函数支持多种不同的数据库操作符，用于执行查询、更新、删除等操作。

## 初始化操作符

```typescript
const db = cloud.database()
const _ = db.command
// 后续操作 用 _ 即可
```

## 查询·逻辑操作符

### and

查询操作符，用于表示逻辑 "与" 的关系，表示需同时满足多个查询筛选条件  

#### 使用说明

 `and` 有两种使用情况：  

**1. 用在根查询条件**

 此时需传入多个查询条件，表示需同时满足提供的多个完整查询条件  

```js
const _ = db.command
let res = await db.collection('todo').where(_.and([
  {
    progress: _.gt(50)
  },
  {
    tags: 'cloud'
  }
])).get()
```

但以上用 `and` 组成的查询条件是不必要的，因为传入的对象的各字段隐式组成了 "与" 的关系，上述条件等价于下方更简洁的写法：  

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.gt(50),
  tags: 'cloud'
}).get()
```

通常需要显示使用 `and` 是用在有跨字段或操作的时候

**2. 用在字段查询条件**

 需传入多个查询操作符或常量，表示字段需满足或匹配给定的条件。  

 如以下用前置写法的方式表示 "progress 字段值大于 50 且小于 100"  

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.and(_.gt(50), _.lt(100))
}).get()
```

还可以用后置写法的方式表示同样的条件：  

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.gt(50).and(_.lt(100))
}).get()
```

注意 `Command` 默认也可以直接链式调用其他 `Command`，默认表示多个 `Command` 的与操作，因此上述代码还可以精简为：  

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.gt(50).lt(100)
}).get()
```

### or

查询操作符，用于表示逻辑 "或" 的关系，表示需同时满足多个查询筛选条件。或指令有两种用法，一是可以进行字段值的 "或" 操作，二是也可以进行跨字段的“或”操作。  

#### 字段值的或操作

 字段值的“或”操作指的是指定一个字段值为多个值之一即可。  

 如筛选出进度大于 80 或小于 20 的 todo：  

 流式写法：  

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.gt(80).or(_.lt(20))
}).get()
```

前置写法：  

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.or(_.gt(80), _.lt(20))
}).get()
```

前置写法也可接收一个数组：  

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.or([_.gt(80), _.lt(20)])
}).get()
```

#### 跨字段的或操作

 跨字段的“或”操作指条件“或”，相当于可以传入多个 where 语句，满足其中一个即可。  

 如筛选出进度大于 80 或已标为已完成的 todo：  

```js
const _ = db.command
let res = await db.collection('todo').where(_.or([
  {
    progress: _.gt(80)
  },
  {
    done: true
  }
])).get()
```

### not

查询操作符，用于表示逻辑 "非" 的关系，表示需不满足指定的条件。  

#### 示例

 如筛选出进度不等于 100 的 todo：  

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.not(_.eq(100))
}).get()
```

`not` 也可搭配其他逻辑指令使用，包括 `and`, `or`, `nor`, `not`，如 `or`：  

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.not(_.or([_.lt(50), _.eq(100)]))
}).get()
```

### nor

查询操作符，用于表示逻辑 "都不" 的关系，表示需不满足指定的所有条件。如果记录中没有对应的字段，则默认满足条件。  

#### 示例 1

 筛选出进度既不小于 20 又不大于 80 的 todo：  

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.nor([_.lt(20), _.gt(80)])
}).get()
```

以上同时会筛选出不存在 `progress` 字段的记录，如果要要求 `progress` 字段存在，可以用 `exists` 指令：  

```js
const _ = db.command
let res = await db.collection('todo').where({
  progress: _.exists(true).nor([_.lt(20), _.gt(80)])
  // 等价于以下非链式调用的写法：
  // progress: _.exists(true).and(_.nor([_.lt(20), _.gt(80)]))
}).get()
```

#### 示例 2

 筛选出 `progress` 不小于 20 且 `tags` 数组不包含 `miniprogram` 字符串的记录：  

```js
const _ = db.command
db.collection('todo').where(_.nor([{
  progress: _.lt(20),
}, {
  tags: 'miniprogram',
}])).get()
```

以上会筛选出满足以下条件之一的记录：  

1. `progress` 不小于 20 且 `tags` 数组不包含 `miniprogram` 字符串 3. `progress` 不小于 20 且 `tags` 字段不存在 5. `progress` 字段不存在 且 `tags` 数组不包含 `miniprogram` 字符串 7. `progress` 不小于 20 且 `tags` 字段不存在
 如果要求 `progress` 和 `tags` 字段存在，可以用 `exists` 指令：  

```js
const _ = db.command
let res = await db.collection('todo').where(
  _.nor([{
    progress: _.lt(20),
  }, {
    tags: 'miniprogram',
  }])
  .and({
    progress: _.exists(true),
    tags: _.exists(true),
  })
).get()
```

## 查询·比较操作符

### eq

查询筛选条件，表示字段等于某个值。`eq` 指令接受一个字面量 (literal)，可以是 `number`, `boolean`, `string`, `object`, `array`, `Date`。  

#### 使用说明

 比如筛选出所有自己发表的文章，除了用传对象的方式：  

```js
const openID = 'xxx'
let res = await db.collection('articles').where({
  _openid: openID
}).get()
```

还可以用指令：  

```js
const _ = db.command
const openID = 'xxx'
let res = await db.collection('articles').where({
  _openid: _.eq(openid)
}).get()
```

注意 `eq` 指令比对象的方式有更大的灵活性，可以用于表示字段等于某个对象的情况，比如：  

```js
// 这种写法表示匹配 stat.publishYear == 2018 且 stat.language == 'zh-CN'
let res = await db.collection('articles').where({
  stat: {
    publishYear: 2018,
    language: 'zh-CN'
  }
}).get()
// 这种写法表示 stat 对象等于 { publishYear: 2018, language: 'zh-CN' }
const _ = db.command
let res = await db.collection('articles').where({
  stat: _.eq({
    publishYear: 2018,
    language: 'zh-CN'
  })
}).get()
```

### neq

查询筛选条件，表示字段不等于某个值。`eq` 指令接受一个字面量 (literal)，可以是 `number`, `boolean`, `string`, `object`, `array`, `Date`。  

#### 使用说明

 表示字段不等于某个值，和 [eq](#eq) 相反

### lt

查询筛选操作符，表示需小于指定值。可以传入 `Date` 对象用于进行日期比较。  

#### 示例代码

 找出进度小于 50 的 todo  

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.lt(50)
})
.get()
```

### lte

查询筛选操作符，表示需小于或等于指定值。可以传入 `Date` 对象用于进行日期比较。  

#### 示例代码

 找出进度小于或等于 50 的 todo  

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.lte(50)
})
.get()
```

### gt

查询筛选操作符，表示需大于指定值。可以传入 `Date` 对象用于进行日期比较。  

#### 示例代码

 找出进度大于 50 的 todo  

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.gt(50)
})
.get()
```

### gte

查询筛选操作符，表示需大于或等于指定值。可以传入 `Date` 对象用于进行日期比较。  

#### 示例代码

 找出进度大于或等于 50 的 todo  

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.gte(50)
})
.get()
```

### in

查询筛选操作符，表示要求值在给定的数组内。  

#### 示例代码

 找出进度为 0 或 100 的 todo  

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.in([0, 100])
})
.get()
```

### nin

查询筛选操作符，表示要求值不在给定的数组内。  

#### 示例代码

 找出进度不是 0 或 100 的 todo  

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.nin([0, 100])
})
.get()
```

## 查询·字段操作符

### exists

判断字段是否存在，true 为存在，false 为不存在

#### 示例代码

 找出存在 tags 字段的记录  

```js
const _ = db.command
let res = await db.collection('todos').where({
  tags: _.exists(true)
})
.get()
```

### mod

查询筛选操作符，给定除数 divisor 和余数 remainder，要求字段作为被除数时 value % divisor = remainder。  

#### 示例代码

 找出进度为 10 的倍数的字段的记录  

```js
const _ = db.command
let res = await db.collection('todos').where({
  progress: _.mod(10, 0)
})
.get()
```

## 查询·数组操作符

### all

数组查询操作符。用于数组字段的查询筛选条件，要求数组字段中包含给定数组的所有元素。  

#### 示例代码 1：普通数组

 找出 tags 数组字段同时包含 cloud 和 database 的记录  

```js
const _ = db.command
let res = await db.collection('todos').where({
  tags: _.all(['cloud', 'database'])
})
.get()
```

#### 示例代码 2：对象数组

 如果数组元素是对象，则可以用 `_.elemMatch` 匹配对象的部分字段  

 假设有字段 `places` 定义如下：  

```js
{
  "type": string
  "area": number
  "age": number
}
```

找出数组字段中至少同时包含一个满足“area 大于 100 且 age 小于 2”的元素和一个满足“type 为 mall 且 age 大于 5”的元素  

```js
const _ = db.command
let res = await db.collection('todos').where({
  places: _.all([
    _.elemMatch({
      area: _.gt(100),
      age: _.lt(2),
    }),
    _.elemMatch({
      type: 'mall',
      age: _.gt(5),
    }),
  ]),
})
.get()
```

### elemMatch

用于数组字段的查询筛选条件，要求数组中包含至少一个满足 `elemMatch` 给定的所有条件的元素  

#### 示例代码：数组是对象数组的情况

 假设集合示例数据如下：  

```js
{
  "_id": "a0",
  "city": "x0",
  "places": [{
    "type": "garden",
    "area": 300,
    "age": 1
  }, {
    "type": "theatre",
    "area": 50,
    "age": 15
  }]
}
```

找出 `places` 数组字段中至少同时包含一个满足“area 大于 100 且 age 小于 2”的元素  

```js
const _ = db.command
let res = await db.collection('todos').where({
  places: _.elemMatch({
    area: _.gt(100),
    age: _.lt(2),
  })
})
.get()
```

*注意**：如果不使用 `elemMatch` 而直接如下指定条件，则表示的是 `places` 数组字段中至少有一个元素的 `area` 字段大于 100 且 `places` 数组字段中至少有一个元素的 `age` 字段小于 2：  

```js
const _ = db.command
let res = await db.collection('todos').where({
  places: {
    area: _.gt(100),
    age: _.lt(2),
  }
})
.get()
```

#### 示例代码：数组元素都是普通数据类型的情况

 假设集合示例数据如下：  

```js
{
  "_id": "a0",
  "scores": [60, 80, 90]
}
```

找出 `scores` 数组字段中至少同时包含一个满足“大于 80 且小于 100”的元素  

```js
const _ = db.command
let res = await db.collection('todos').where({
  scores: _.elemMatch(_.gt(80).lt(100))
})
.get()
```

### size

更新操作符，用于数组字段的查询筛选条件，要求数组长度为给定值  

#### 示例

 找出 tags 数组字段长度为 2 的所有记录  

```js
const _ = db.command
let res = await db.collection('todos').where({
  places: _.size(2)
})
.get()
```

## 查询·地理位置操作符

### geoNear

按从近到远的顺序，找出字段值在给定点的附近的记录。  

#### 索引要求

 需对查询字段建立地理位置索引  

#### 示例代码

 找出离给定位置 1 公里到 5 公里范围内的记录  

```js
const _ = db.command
let res = await db.collection('restaurants').where({
  location: _.geoNear({
    geometry: new db.Geo.Point(113.323809, 23.097732),
    minDistance: 1000,
    maxDistance: 5000,
  })
}).get()
```

### geoWithin

找出字段值在指定区域内的记录，无排序。指定的区域必须是多边形（Polygon）或多边形集合（MultiPolygon）。  

#### 索引要求

 需对查询字段建立地理位置索引  

#### 示例代码 1：给定多边形

```js
const _ = db.command
const { Point, LineString, Polygon } = db.Geo
let res = await .collection('restaurants').where({
  location: _.geoWithin({
    geometry: new Polygon([
      new LineString([
        new Point(0, 0),
        new Point(3, 2),
        new Point(2, 3),
        new Point(0, 0)
      ])
    ]),
  })
}).get()
```

#### 示例代码 2：给定圆形

 可以不用 `geometry` 而用 `centerSphere` 构建一个圆形。  

  `centerSphere` 对应的值的定义是：`[ [经度, 纬度], 半径 ]`  

 半径需以弧度计，比如需要 10km 的半径，则用距离除以地球半径 6378.1km 得出的数字。  

```js
const _ = db.command
let res = await db.collection('restaurants').where({
  location: _.geoWithin({
    centerSphere: [
      [-88, 30],
      10 / 6378.1,
    ]
  })
}).get()
```

### geoIntersects

找出给定的地理位置图形相交的记录  

#### 索引要求

 需对查询字段建立地理位置索引  

#### 示例代码：找出和一个多边形相交的记录

```js
const _ = db.command
const { Point, LineString, Polygon } = db.Geo
let res = await db.collection('restaurants').where({
  location: _.geoIntersects({
    geometry: new Polygon([
      new LineString([
        new Point(0, 0),
        new Point(3, 2),
        new Point(2, 3),
        new Point(0, 0)
      ])
    ]),
  })
}).get()
```

## 查询·表达式操作符

### expr

查询操作符，用于在查询语句中使用聚合表达式，方法接收一个参数，该参数必须为聚合表达式  

#### 使用说明

1. `expr` 可用于在聚合 `match`流水线阶段中引入聚合表达式 3. 如果聚合 `match`阶段是在 `lookup`) 阶段内，此时的 `expr` 表达式内可使用 `lookup` 中使用 `let` 参数定义的变量，具体示例可见 `lookup` 的 `指定多个连接条件` 例子 5. `expr` 可用在普通查询语句（`where`）中引入聚合表达式

#### 示例代码 1：比较同一个记录中的两个字段

 假设 `items` 集合的数据结构如下：  

```js
{
  "_id": string,
  "inStock": number, // 库存量
  "ordered": number  // 被订量
}
```

找出被订量大于库存量的记录：  

```js
const _ = db.command
const $ = _.aggregate
let res = await db.collection('items').where(_.expr($.gt(['$ordered', '$inStock']))).get()
```

#### 示例代码 2：与条件语句组合使用

 假设 `items` 集合的数据结构如下：  

```json
{
  "_id": string,
  "price": number
}
```

假设价格小于等于 10 的打 8 折，大于 10 的打 5 折，让数据库查询返回打折后价格小于等于 8 的记录：  

```js
const _ = db.command
const $ = _.aggregate
let res = await db.collection('items').where(
  _.expr(
    $.lt([
      $.cond({
        if: $.gte(['$price', 10]),
        then: $.multiply(['$price', '0.5']),
        else: $.multiply(['$price', '0.8']),
      })
      ,
      8
    ])
)).get()
```

## 更新·字段操作符

### set

更新操作符，用于设定字段等于指定值。  

#### 使用说明

 这种方法相比传入纯 JS 对象的好处是能够指定字段等于一个对象  

#### 示例

```js
// 以下方法只会更新 style.color 为 red，而不是将 style 更新为 { color: 'red' }，即不影响 style 中的其他字段
let res = await db.collection('todos').doc('doc-id').update({
  style: {
    color: 'red'
  }
})

// 以下方法更新 style 为 { color: 'red', size: 'large' }
let res = await db.collection('todos').doc('doc-id').update({
  style: _.set({
    color: 'red',
    size: 'large'
  })
})
```

### remove

更新操作符，用于表示删除某个字段。  

#### 示例代码

 删除 style 字段：  

```js
const _ = db.command
let res = await db.collection('todos').doc('todo-id').update({
  style: _.remove()
})
```

### inc

更新操作符，原子操作，用于指示字段自增  

#### 原子自增

 多个用户同时写，对数据库来说都是将字段自增，不会有后来者覆写前者的情况  

#### 示例代码

 将一个 todo 的进度自增 10：  

```js
const _ = db.command
let res = await db.collection('todos').doc('todo-id').update({
  progress: _.inc(10)
})
```

### mul

更新操作符，原子操作，用于指示字段自乘某个值  

#### 原子自乘

 多个用户同时写，对数据库来说都是将字段自乘，不会有后来者覆写前者的情况  

#### 示例代码

 将一个 todo 的进度自乘 10：  

```js
const _ = db.command
let res = await db.collection('todos').doc('todo-id').update({
  progress: _.mul(10)
})
```

### min

更新操作符，给定一个值，只有该值小于字段当前值才进行更新。  

#### 示例代码

 如果字段 progress > 50，则更新到 50  

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  progress: _.min(50)
})
```

### max

更新操作符，给定一个值，只有该值大于字段当前值才进行更新。  

#### 示例代码

 如果字段 progress < 50，则更新到 50  

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  progress: _.max(50)
})
```

### rename

更新操作符，字段重命名。如果需要对嵌套深层的字段做重命名，需要用点路径表示法。不能对嵌套在数组里的对象的字段进行重命名。  

#### 示例 1：重命名顶层字段

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  progress: _.rename('totalProgress')
})
```

#### 示例 2：重命名嵌套字段

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  someObject: {
    someField: _.rename('someObject.renamedField')
  }
})
```

或：

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  'someObject.someField': _.rename('someObject.renamedField')
})
```

## 更新·数组操作符

### push

数组更新操作符。对一个值为数组的字段，往数组添加一个或多个值。或字段原为空，则创建该字段并设数组为传入值。  

#### 参数说明

**position 说明**

 要求必须同时有 `each` 参数存在。  

 非负数代表从数组开始位置数的位置，从 0 开始计。如果数值大于等于数组长度，则视为在尾部添加。负数代表从数组尾部倒数的位置，比如 -1 就代表倒数第二个元素的位置。如果负数数值的绝对值大于等于数组长度，则视为从数组头部添加。  

**sort 说明**

 要求必须同时有 `each` 参数存在。给定 1 代表升序，-1 代表降序。  

 如果数组元素是记录，则用 `{ <字段>: 1 | -1 }` 的格式表示根据记录中的什么字段做升降序排序。  

**slice** 说明**

 要求必须同时有 `each` 参数存在  

|值  |说明         |
|:-: |:-:         |
|0  |将字段更新为空数组  |
|正数 |数组只保留前 n 个元素|
|负数 |数组只保留后 n 个元素|

#### 示例 1：尾部添加元素

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push(['mini-program', 'cloud'])
})
```

#### 示例 2：从第二个位置开始插入

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: ['mini-program', 'cloud'],
    position: 1,
  })
})
```

#### 示例 3：排序

插入后对整个数组做排序  

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: ['mini-program', 'cloud'],
    sort: 1,
  })
})
```

不插入，只对数组做排序  

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: [],
    sort: 1,
  })
})
```

如果字段是对象数组，可以如下根据元素对象里的字段进行排序：  

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: [
      { name: 'miniprogram', weight: 8 },
      { name: 'cloud', weight: 6 },
    ],
    sort: {
      weight: 1,
    },
  })
})
```

#### 示例 4：截断保留

 插入后只保留后 2 个元素  

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: ['mini-program', 'cloud'],
    slice: -2,
  })
})
```

#### 示例 5：在指定位置插入、然后排序、最后只保留前 2 个元素

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.push({
    each: ['mini-program', 'cloud'],
    position: 1,
    slice: 2,
    sort: 1,
  })
})
```

### pop

数组更新操作符，对一个值为数组的字段，将数组尾部元素删除，仅可以删除末尾一个

#### 示例代码

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.pop()
})
```

### unshift

数组更新操作符，对一个值为数组的字段，往数组头部添加一个或多个值。或字段原为空，则创建该字段并设数组为传入值。  

#### 示例代码

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.unshift(['mini-program', 'cloud'])
})
```

### shift

数组更新操作符，对一个值为数组的字段，将数组头部元素删除。  

#### 示例代码

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.shift()
})
```

### pull

数组更新操作符。给定一个值或一个查询条件，将数组中所有匹配给定值或查询条件的元素都移除掉。  

#### 示例代码 1：根据常量匹配移除

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.pull('database')
})
```

#### 示例代码 2：根据查询条件匹配移除

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.pull(_.in(['database', 'cloud']))
})
```

#### 示例代码 3：对象数组时，根据查询条件匹配移除

 假设有字段 `places` 数组中的元素结构如下  

```json
{
  "type": string
  "area": number
  "age": number
}
```

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  places: _.pull({
    area: _.gt(100),
    age: _.lt(2),
  })
})
```

#### 示例代码 4：有嵌套对象的对象数组时，根据查询条件匹配移除

 假设有字段 `cities` 数组中的元素结构如下  

```js
{
  "name": string
  "places": Place[]
}
```

`Place` 结构如下：  

```js
{
  "type": string
  "area": number
  "age": number
}
```

可用 `elemMatch` 匹配嵌套在对象数组里面的对象数组字段 places  

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  cities: _.pull({
    places: _.elemMatch({
      area: _.gt(100),
      age: _.lt(2),
    })
  })
})
```

### pullAll

数组更新操作符。给定一个值或一个查询条件，将数组中所有匹配给定值的元素都移除掉。跟 `pull` 的差别在于只能指定常量值、传入的是数组。  

#### 示例代码：根据常量匹配移除

 从 tags 中移除所有 database 和 cloud 字符串  

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.pullAll(['database', 'cloud'])
})
```

### addToSet

数组更新操作符。原子操作。给定一个或多个元素，除非数组中已存在该元素，否则添加进数组。  

#### 示例代码 1：添加一个元素

 如果 tags 数组中不包含 database，添加进去  

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.addToSet('database')
})
```

#### 示例代码 2：添加多个元素

需传入一个对象，其中有一个字段 `each`，其值为数组，每个元素就是要添加的元素  

```js
const _ = db.command
let res = await db.collection('todos').doc('doc-id').update({
  tags: _.addToSet({
    $each: ['database', 'cloud']
  })
})
```
