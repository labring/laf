# 数据库 SDK 设计说明

`@author` haroldhu

[TOC]

## 文件说明

```md
- collection.ts   // 集合模块，继承 Query 模块
- constant.ts     // 常量模块
- db.ts           // 数据库模块
- document.ts     // 文档模块
- model.ts        // 类型约束模块
- query.ts        // 查询模块
- request.ts      // 请求模块 - 临时模拟使用
- util.ts         // 工具模块
- validate.ts     // 校验模块
```

## 常用命令

```shell
# 编辑 typescript
tnpm run tsc

# 实时编译 typescript
tnpm run tsc:w

# 运行测试用例
tnpm run tstest
```

## 类型声明

类型声明写在`.ts`文件里，这样可以及时发现问题。`.d.ts`不能及时暴露问题。

## 设计说明

集合模块继承 Query 模块，为了更好使用查询条件。

主要参考了 firebase - firestore 的设计。

## 字段设计

拉取文档列表后，过滤一遍数据，把特殊类型的字段格式化为相应的js对象。

发送请求新增或更新文档时，过滤一遍数据，把特殊字段编码为后端数据格式。

### 地理位置

每一个地理位置都是一个`GeoPoint`对象。

#### 为什么不在类下面增加一个方法转换成后端数据格式？

这个开发者用不到，所以没有必要暴露出来。

### 日期时间

每一个日期时间都是一个`Date`对象。

## 整体设计

- 使用`document.get()`获取数据时，把`where()`、`orderBy()`、`limit()`、`offser()`、设置的数据拼接到请求里。
- 对后台返回的数据进行格式化，使其成为一个`DocumentSnapshot`对象，对特殊类型的字段，如地理位置、日期时间进行处理。
- 使用`document.set()`和`document.update()`时，把数据进行编码，尤其是特殊字段的处理，编码成后端接口的数据格式。

## 扩展说明

开发者可以在每篇文档里记录创建时间和更新时间。

- 创建时间是一个时间对象
- 更新时间时一个时间对象的数组
