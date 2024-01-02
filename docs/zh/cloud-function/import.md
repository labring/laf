

# 函数引用

本节介绍云函数之间的引用，主要用于复用代码逻辑。

::: info 本节目录
[[toc]]
:::

## import

本例创建一个工具模块 `utils`，可供其它云函数引入调用。

::: tip 创建一个云函数名为 `utils`，做为工具模块使用
```typescript
import { createHash, randomUUID } from 'crypto'

export function md5(data: any) {
  return createHash('md5').update(data).digest('hex')
}

export function sha256(data: any) {
  return createHash('sha256').update(data).digest('hex')
}

export function uuid() {
  return randomUUID()
}
```
:::

::: warning 在云函数中引用 `utils` 工具函数
```typescript
import { uuid, md5 } from '@/utils'

export default async function (ctx: FunctionContext) {
  console.log('生成一个 UUID: ', uuid())
  console.log('计算 md5 值: ', md5('123456'))
}
```
:::

::: details 查看输出结果
```text
生成一个 UUID:  25fdca90-9211-4bf2-952a-900356b05eb4
计算 md5 值:  e10adc3949ba59abbe56e057f20f883e
```
:::

## 实现一个内存缓存

每个云函数模块，可当成一个 Node.js module 使用，我们使用函数模块来实现一个简单的缓存模块

::: tip 创建一个云函数名为 `memcache`，实现一个缓存模块
```typescript
const cached = new Map()

function get(key: string) {
  return cached.get(key)
}

function set(key: string, value: any) {
  cached.set(key, value)
}

function keys() {
  return cached.keys()
}

function size() {
  return cached.size
}

function remove (key: string) {
  return cached.delete(key)
}

function clear() {
  cached.clear()
}


export default { get, set, keys, size, remove, clear }
```
:::

::: warning 在云函数中使用 `memcache` 缓存
```typescript
import cache from '@/memcache'

export default async function (ctx: FunctionContext) {
  cache.set('name', 'maslow')
  console.log(cache.get('name'))

  cache.clear()
  console.log(cache.size())
}
```
:::

::: details 查看输出结果
```text
maslow
0
```
:::

## 下一步
::: tip
- [HTTP 请求](./request.md)
- [HTTP 响应](./response.md)
- [HTTP 认证](./auth.md)
- [处理文件上传](./files.md)
- [发起网络请求](./fetch.md)
- [环境变量](./env.md)
- [云存储](../cloud-storage/index.md)
:::

