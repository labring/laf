### 文件访问令牌(Token)机制

Laf 提供基于 `bucket` （文件桶）方式管理的文件存储服务。

开发者也可在开发控制台中创建私有桶，需要生成文件令牌 token 来访问，以实现应用自定义的文件访问权限控制。

### 文件访问令牌（Token）生成

- 令牌为标准 JWT 令牌
- 文件令牌需在云函数中生成

云函数示例：生成可从`test` 桶中上传和下载的 token：

```ts
import cloud from "@/cloud";

exports.main = async function (ctx) {
  const payload = {
    ns: `${cloud.appid}_test`,
    op: "rwdl",
    // token 有效期为 24 小时，请务必提供此 `exp` 字段，详见 JWT 文档。
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  const file_token = cloud.getToken(payload);
  console.log(file_token);

  return file_token;
};
```

### 使用文件令牌

只需在请求文件操作的 URL Query 中加个 `token` 字段即可：

```js
const token = "xxxxx";
const url = `http://appid_public.fs.local-dev.host:8080/?token=${token}`;
console.log(url);
```

### 附：《文件令牌 Payload 结构》

```ts
{
   ns: string,         // 授权的文件桶名字，需要在前面拼上 `${appid}_`
   op: string[],      // 授权的文件操作，可以是以下值之一或组合， 'r' | 'w' | 'd' | 'l' 分别对应 read、write、delete、list 操作
   fn?: string,        // 可选的文件名，如果指定，则该 token 只能访问此文件名
   exp: number         // 过期时间，时间截(秒)
}
```
