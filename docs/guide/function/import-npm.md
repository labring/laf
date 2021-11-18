---
title: 使用 Node.js 包
---

在云函数中，可使用 Node.js 内置的包，也支持引用三方的 npm 依赖包。

## 使用 Node.js 内置包

```ts
import cloud from '@/cloud-sdk'
import * as crypto from 'crypto'
import * as path from 'path'
import * as fs from 'fs'

// ... 其它包也如此引入
// 请不要使用 require() 引入包，虽然也能运行，但在线 IDE 无法给出智能提示

exports.main = async function (ctx) {
  const { password } = await ctx.body

  const password_hash = crypto.createHash('sha256')
    .update(content)
    .digest('hex')

  return password_hash
}
```


## 使用三方的 NPM 包

```ts
import cloud from '@/cloud-sdk'
import * as _ from 'lodash'
import * as dayjs from 'dayjs'
import * as $ from 'validator'
import * as axios from 'axios'
import { ObjectId } from 'mongodb'

exports.main = async function (ctx) {
  const res = await axios('http://www.baidu.com/')
  console.log(res.data)

  const uuid_str = uuid()
  console.log(uuid_str)

  const _id = new ObjectId(ctx.body.id)

  return ret.data
}
```

