---
title: 发送邮件
---

# {{ $frontmatter.title }}

使用 SMTP 服务发送邮件。

创建 `sendmail` 云函数，添加依赖 `nodemailer`，编写以下代码：

```ts
import * as nodemailer from 'nodemailer'

// 邮件服务器配置
const transportConfig = {
  host: 'smtp.exmail.qq.com', // smtp 服务地址，示例腾讯企业邮箱地址
  port: 465,  // smtp 服务端口，一般服务器未开此端口，需要手动开启
  secureConnection: true, // 使用了 SSL
  auth: {
    user: 'sender@xx.com',  // 发件人邮箱，写你的邮箱地址即可
    pass: 'your password',  // 你设置的smtp专用密码或登录密码，每家服务不相同，QQ邮箱需要开启并配置授权码，即这里的pass
  }
}

// 邮件配置
const mailOptions = {
  from: '"SenderName" <sender@xx.com>', // 发件人
  to: 'hi@xx.com', // 收件人
  subject: 'Hello',   // 邮件主题
  html: '<b>Hello world?</b>'  // html 格式邮件正文
  // text: 'hello'  // 文本格式有限正文
}

exports.main = async function (ctx) {
  const transporter = nodemailer.createTransport(transportConfig)

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    return info.messageId
  })
};
```
