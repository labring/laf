
# 微信小程序中上传文件


::: tip
在云函数中操作云存储，需要提前创建一个存储桶（Bucket），以下示例使用 `data` 存储桶演示上传文件操作，请提前创建该存储桶。
:::

## 接受上传文件的云函数

```typescript
import cloud from "@lafjs/cloud"
import { readFile } from 'fs/promises'

export default async function (ctx: FunctionContext) {
  const file = ctx.files[0]
  const data = await readFile(file.path)

  const bucket = cloud.storage.bucket('data')
  await bucket.writeFile(file.filename, data, {
    ContentType: file.mimetype
  })

  const url = bucket.externalUrl(file.filename)
  return url
}
```


## 小程序中上传文件到云函数

以微信小程序为例

```js
// 微信聊天回话选择文件
wx.chooseMessageFile({
  count: 1,
  type: 'all',
  success(res) {
    // 选择的文件临时路径
    const tempFilePaths = res.tempFiles[0].path
    wx.uploadFile({
      url: '云函数地址',
      filePath: tempFilePaths,
      name: 'file',
      success(res) {
        console.log(res.data)
      }
    })
  }
})
```
