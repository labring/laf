---
title: Custom Menu
---

# {{ $frontmatter.title }}

Since our own server is integrated, the built-in menu management of the official account becomes unavailable. We can manage the menu through cloud functions.

## Create and Publish a Cloud Function

Obtain the `appid` and `appsecret` from the backend of the official account and set them as environment variables `WECHAT_APPID` and `WECHAT_SECRET`.

```typescript
const appid = process.env.WECHAT_APPID
const appsecret = process.env.WECHAT_SECRET

// Take the menu configuration of laf developer official account as an example
const menu = {
  button: [
    { type: 'view', name: 'User Forum', url: 'https://forum.laf.run/' },
    {
      type: 'media_id',
      name: 'Join the Group Now',
      media_id: 'EvjUO0_eaTT2pBbYYcM5trVz_aFexNcXDkACOvQLDAUZhJXSe0zTenPiOQZPHzRJ'
    },
    {
      name: 'About Us',
      sub_button: [
        { type: 'view', name: 'Domestic Website', url: 'https://laf.run' },
        { type: 'view', name: 'Overseas Website', url: 'https://laf.dev' },
        {
          type: 'view',
          name: 'GitHub',
          url: 'https://github.com/labring/laf'
        },
        {
          type: 'view',
          name: 'Contact Us',
          url: 'https://www.wenjuan.com/s/I36ZNbl/#'
        }
      ]
    }
  ]
}

export default async function (ctx: FunctionContext) {
  // Print the current menu
  console.log(await getMenu())
  // Set the menu
  const res = await setMenu(menu)
}

// Get the menu of the official account
async function getMenu() {
  const access_token = await getAccess_token()
  const res = await cloud.fetch.get(`https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=${access_token}`)
  return res.data
}

// Set the menu of the official account
export async function setMenu(menu) {
  const access_token = await getAccess_token()
  const res = await cloud.fetch.post(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${access_token}`, menu)
  console.log("setting success", res.data)
  return res.data
}

// Get the ACCESS_TOKEN of WeChat official account
async function getAccess_token() {
  // Check if the ACCESS_TOKEN of the WeChat official account is expired
  const shared_access_token = cloud.shared.get("mp_access_token")
  if (shared_access_token) {
    if (shared_access_token.exp > Date.now()) {
      return shared_access_token.access_token
    }
  }
  // Obtain the ACCESS_TOKEN of the WeChat official account, save it with an expiration time, and then save it to the cache
  const mp_access_token = await cloud.fetch.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`)
  cloud.shared.set("mp_access_token", {
    access_token: mp_access_token.data.access_token,
    exp: Date.now() + 7100 * 1000
  })
  return mp_access_token.data.access_token
}
```

## Debugging and Running

You can directly debug and run it in the Web IDE to publish the official account menu. You can also make it a POST request, pass in the value of menu, and configure the official account menu through other front-end methods.

## Get Media_id

If there is a requirement to send a file after clicking on a menu, the Media_id of the file needs to be obtained.

For example, if there is a requirement to send a specified QR code image automatically when "Join Group Now" is clicked, the image needs to be uploaded and its Media_id needs to be obtained.

```typescript
export default async function (ctx: FunctionContext) {
  
  const url = 'https://xxx.xxx.xxx/pic.jpg'
  const res = await updatePic(url)
  console.log('Media_id',res)
}

// Uploads the image to WeChat temporary media by the image URL
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

## For more menu-related information, you can refer to the WeChat development documentation for integration

Link: <https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Creating_Custom-Defined_Menu.html>
