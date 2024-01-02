---
title: 自定义菜单
---

# {{ $frontmatter.title }}

由于对接了自己的服务器，公众号自带的菜单管理变得不可用，我们可以通过云函数去管理菜单

## 新建云函数并发布

从公众号后台获取 `appid` 和 `appsecret` 并设置到环境变量中 `WECHAT_APPID` 和 `WECHAT_SECRET` 中

```typescript
const appid = process.env.WECHAT_APPID
const appsecret = process.env.WECHAT_SECRET

// 以 laf 开发者官方公众号菜单配置举例
const menu = {
  button: [
    { type: 'view', name: '用户论坛', url: 'https://forum.laf.run/' },
    {
      type: 'media_id',
      name: '马上进群',
      media_id: 'EvjUO0_eaTT2pBbYYcM5trVz_aFexNcXDkACOvQLDAUZhJXSe0zTenPiOQZPHzRJ'
    },
    {
      name: '关于我们',
      sub_button: [
        { type: 'view', name: '国内网站', url: 'https://laf.run' },
        { type: 'view', name: '国外网站', url: 'https://laf.dev' },
        {
          type: 'view',
          name: 'GitHub',
          url: 'https://github.com/labring/laf'
        },
        {
          type: 'view',
          name: '联系我们',
          url: 'https://www.wenjuan.com/s/I36ZNbl/#'
        }
      ]
    }
  ]
}

export default async function (ctx: FunctionContext) {
  // 打印当前菜单
  console.log(await getMenu())
  // 设置菜单
  const res = await setMenu(menu)
}

// 获取公众号菜单
async function getMenu() {
  const access_token = await getAccess_token()
  const res = await cloud.fetch.get(`https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=${access_token}`)
  return res.data
}

// 设置公众号菜单
export async function setMenu(menu) {
  const access_token = await getAccess_token()
  const res = await cloud.fetch.post(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${access_token}`, menu)
  console.log("setting success", res.data)
  return res.data
}

// 获取微信公众号 ACCESS_TOKEN
async function getAccess_token() {
  // 判断档期微信公众号 ACCESS_TOKEN 是否过期
  const shared_access_token = cloud.shared.get("mp_access_token")
  if (shared_access_token) {
    if (shared_access_token.exp > Date.now()) {
      return shared_access_token.access_token
    }
  }
  // 获取微信公众号 ACCESS_TOKEN 并保存添加过期时间后保存到缓存中
  const mp_access_token = await cloud.fetch.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`)
  cloud.shared.set("mp_access_token", {
    access_token: mp_access_token.data.access_token,
    exp: Date.now() + 7100 * 1000
  })
  return mp_access_token.data.access_token
}
```

## 调试运行

直接在 Web IDE 中调试运行，即可实现发布公众号菜单了。也可以做成一个 Post 请求，传入 menu 的值，通过其他的前端去配置公众号菜单

## 获取 Media_id

如果有点击菜单后发送的需求。需要获取文件的 Media_id

如点击马上进群，公众号自动发送指定二维码图片，需要上传图片并获取 Media_id

```typescript
export default async function (ctx: FunctionContext) {
  
  const url = 'https://xxx.xxx.xxx/pic.jpg'
  const res = await updatePic(url)
  console.log('Media_id',res)
}

// 通过图片 Url 到微信临时素材
async function updatePic(url) {
  const match = /^https?:\/\/[^\/]*\/.*?[^A-Za-z0-9]*?([A-Za-z0-9]+).([A-Za-z0-9]+)[^A-Za-z0-9]*?(?:.*)$/.exec(url)
  const pic_name = `${match[1]}.${match[2]}`
  const res = await cloud.fetch.get(url, {
    responseType: 'arraybuffer'
  })
  const access_token = await getAccess_token()
  const formData = {
    media: {
      value: Buffer.from(res.data),
      options: {
        filename: pic_name,
        contentType: 'image/png'
      }
    }
  };
  const request = require('request');
  const util = require('util');
  const postRequest = util.promisify(request.post);
  const uploadResponse = await postRequest({
    url: `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${access_token}&type=image`,
    formData: formData
  });
  return uploadResponse.body
}
```

## 更多菜单相关可根据微信开发文档接入

<https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Creating_Custom-Defined_Menu.html>
