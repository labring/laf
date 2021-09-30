
### Query 安全性考虑

#### 规则为数组时
```
query: ["id", "status"]

query { $or: [...] }          // 这种情况可绕过数组限制 @TODO
query { "id": 0, $or: [...] } // 这种情况可绕过数组限制 @TODO
```

如果不用数组，是否可限定指定字段
```
query: {
  id: "$uid == query.id",   // 此种情况下，如果客户端不传 id，则无效，需指定 required = true
  status: { 
    required: true,         // 此种情况下，可强制开启
    condition: "$value==1"  
  }
}
```

结论：
如果不用数组，可通过 required 强制启用指定字段，但是仍然可通过 opeartor 指定。
数组需要单独处理，如果需要数组限定范围，可禁用 operator。
或者，递归遍历所有操作符内的字段，继续使用数组限定范围。 【已按此实现】

### Query 规则场景

#### 场景1: 用户数据简单查询

使用 contidion 验证器，严格验证，指定权限下限，可确定数据安全。
```
condition: "$uid==query.uid"
```

使用 query 字段约束, 非严格验证，用户若不传 uid 则不会触发该约束
```
query: {
  uid: "$value == $uid"
}
```

使用 query 验证多条件

以下规则并不是「强制」的，只有用户传了某字段，才会触发该字段验证，如需强制验证需设置 required: true
1. 其中，如果用户不传 uid 则不会触发 uid 的约束条件。
2. 此 query 原定是可以限定用户只能用 uid 和 status 查询，但现在存在 operator 绕过的漏洞。【已修复：递归枚举所有输入查询字段,实现了字段的限定】
```
query: {
  uid: "$value == $uid",
  status: { in: ['saved', 'published'], required: true},
}
```

使用 query 验证是否可绕过?
```
query: {
  created_by: {
    required: true,
    cond: "$value == $uid"
  }
}
// 问：如果用户使用 $or: [ created_by: 1, status: true] 是否能绕过以上 cond 验证，从而以 status 为依据?
// 答：不能，query 验证器是以规则中配置的 fields 为依据判定和取值的，以上规则 query.created_by 表达式是取不到值的。
//    即，query 验证器中显式定义约束的字段，如果出现在操作符内，其值是 undefined，无法通过约束，所以约束有效。
```


#### 场景2：存在逻辑删除数据的查询

##### 若有专用字段存储删除状态时:

默认查询未删除的数据，此写法有要求数据有 del_flag 字段且值为 0 的 data 约束，如果该文档中没有此字段，则查询不到。
且该约束并不强制用户只能访问 未删除数据，只是缺省查询未删除。
如果用户指定 del_flag 为其它值，也是可以查询的。
```
query: {
  del_flag: { default: 0 }
}
```

如果要禁止用户访问已逻辑删除的数据：
```
// 此方法禁止查询删除的数据，且前端必须传此字段
query: {
  del_flag: { 
    condition: "$value != 1", 
    required: true 
  }
}
// 
query: {
  del_flag: { override: 1 }
}
```

##### 逻辑删除更新

```
// 用户可删除或恢复自己创建的数据，如果用户不修改 del_flag，则不传即可，不影响修改其它字段
update: {
  data: {
    del_flag: {
      cond: "$uid == query.created_by",
      in: [0,1]
    },
    otherfield: {...}
  }
}

// 禁止用户删除数据，即禁止修改 del_flag，但可修改其它字段
// 只要不配置 del_field 字段的约束即可，缺省禁止更新
update: {
  data: {
    otherfield: {...}
  },
  // 或者
  data: ["otherfield1", "otherfield2"]
}

// 补充说明，若缺省 data 规则，则用户可修改所有字段
update: {
  condition: true
}

```



