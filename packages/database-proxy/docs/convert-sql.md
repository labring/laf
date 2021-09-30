
## Mongo 查询语法转 SQL 的分析

### case 1
```js
query = {}
// where 1=1
```

### case 2

```js
query = { id: 0}
// where 1=1 and id = 0
```

### case 3

```js
query = { id: 0, name: "abc"}
// where 1=1 and id = 0 and name = "abc"
```

### case 4

```js
query = {
  id: 0,
  f1: {
    f2: 0
  }
}
// Error，不支持此种嵌套属性
```

### case 5

```js
query = {
  f1: 0, 
  f2: {
    $ne: 0
  },
  f3: {
    $in: [1, 2, 3]
  }
}

// where 1=1 and f1 = 0 and f2 <> 0 and f3 in (1, 2, 3)
```

### case 6

```js
query = {
  f1: 0,
  $and: [
    {
      f2: { $gt: 0 }
    },
    {
      f2: { $lt: 1 }
    }
  ]
}

// where 1=1 and f1 = 0 and (f2 > 0 and f2 < 1)
```

### case 7

```js
query = {
  f1: 0,
  $or: [
    {
      f2: { $gt: 0 }
    },
    {
      f2: { $lt: 1 }
    }
  ]
}

// where 1=1 and f1 = 0 and (f2 > 0 or f2 < 1)
```

### case 8

```js
query = {
  f1: 0,
  '$or': [
    { f2: 1},
    { f6: { '$lt': 4000 } },
    {
      '$and': [ { f6: { '$gt': 6000 } }, { f6: { '$lt': 8000 } } ]
    }
  ]
}

// where 1=1 and f1 = 0 and (f2 = 1 or f6 < 4000 or (f6 > 6000 and f6 < 8000))
```

### case 9

```js
query = {
  f1: 0,
  f2: {
    $like: '%keyword%'
  }
}

// where 1=1 and f1 = 0 and f2 like "%keyword%"
```

## Mongo 更新语法转 SQL 的分析

### case 1

```js
data = {
  $set: {
    f1: 0,
    f2: 1
  }
}

// update xxx set f1 = 0, f2 = 1 where 1=1
```

### case 2

```js
// 此种语法对应的是 less-api-client-js 的 `set` 方法，会覆盖整个文档，Mysql 并不支持此种写法
data = {
  f1: 0,
  f2: 1
}

// 遇到此种写法，应直接报错 或者 生成 update xxx set f1 = 0, f2 = 1 where 1=1 兼容执行
```

### case 3

```js
data = {
  '$set': { name: "abc" },
  '$inc': { upvote: 1 },
}

// update xxx set name = "abc", upvote = upvote + 1 where 1=1
```

### case 4

```js
data = {
  $set: { f1: 0}, 
  '$unset': { f2: '' }
}

// Error：MySQL不支持 $unset 操作，可直接报错 或者 生成 set f2 = null 兼容执行
// 建议客户端使用 $set: { f1: 0, f2: null} 方式代替 $unset
// 其它操作如 $push $pop $shift $unshift 数组操作同理，不支持且不兼容
```

## 注意事项

### 参数化防注入

生成的 sql 应该满足参数化要求，以防止 SQL 注入， 上面生成的 SQL 示例并不是参数化版的。

```sql
-- 非参数化版
where 1=1 and id = 0 and name = "abc"

-- 参数化版 SQL
where 1=1 and id = ? and name = ?

-- values
values = [0, "abc"]
```

### 使用条件与限制
  1. 不允许嵌套属性查询
  2. 暂不支持 like [已支持]
  3. 暂不支持 联表查询
  4. 暂不支持事务