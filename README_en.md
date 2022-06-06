![laf](https://socialify.git.ci/labring/laf/image?description=1&descriptionEditable=Write%20code%20like%20writing%20a%20blog!&font=Inter&forks=1&language=1&name=1&owner=1&pattern=Circuit%20Board&stargazers=1&theme=Dark)

<div align="center">
  <p>
    <b>Write code like writing a blog!</b>
  </p>

  <p>
    
  [![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/labring/laf)
  [![](https://img.shields.io/docker/pulls/lafyun/system-server)](https://hub.docker.com/r/lafyun/system-server)
  ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?logo=typescript&logoColor=white)
  [![Website](https://img.shields.io/website?url=https%3A%2F%2Fdocs.lafyun.com&logo=Postwoman)](https://docs.lafyun.com/)
  <a href="https://oss.lafyun.com/wofnib-image/2022-04-22-14-21-MRJH9o.png"><img src="https://img.shields.io/badge/%E5%BE%AE%E4%BF%A1%E7%BE%A4-2000%2B-brightgreen"></a>

  </p>
</div>

---

> English | [中文](README.md)

## 👀 What is `laf`

- laf is a cloud-native development platform
- laf is an open-source BaaS platform（Backend as a Service)
- laf is an out-of-the-box serverless platform.
- laf is an one-stop-shop for all your cloud-native development needs:
  - Cloud Function
  - Cloud Datastore
  - Cloud Storage
  - API Gateway
  - _And MORE!_
- laf can be the open-source alternative to **Firebase**.
- laf can be the self-hosted and automatically configured alternative to **AWS** with all its cloud native capabilities and so much more!

[`laf`](https://github.com/labring/laf) provides **teams of any sizes** with a single, unified cloud-native development platform **at any time** with almost **zero cost**!

## 🎉 What does `laf` provide

- **Application Management**
  - deploy/start/stop your application within seconds. There's no need to configure anything!
- **Cloud Function**
  - run your code in the cloud zero extra cost.
- **Cloud Database**
  - out-of-the-box DB service for your applications.
- **Cloud Storage**
  - easy-to-use storage service that are **compatible with AWS S3** and more.
- **WebIDE**
  - a cloud-native IDE for your code with code-linting, formatting and auto completion.
- **Static Site Hosting**
  - only one click to deploy your static sites, no more **Nginx** configuration!
- **Client DB**
  - Supports **"direct" access** from front-end client to your cloud database through [laf-client-sdk](https://github.com/labring/laf/tree/main/packages/client-sdk) with fine-grained access control.
  - Speed up your development and **no more naive CRUD**!
- **WebSocket**
  - Built-in support for WebSocket, everything you need is included!

### Some Screen Shots of `laf` Dashboard:

<table>
  <tr>
      <td width="50%" align="center"><b>Cloud Function</b></td>
      <td width="50%" align="center"><b>Cloud Storage</b></td>
  </tr>
  <tr>
     <td><img src="https://9b069020-06e3-4949-83d9-992a52ca99fe.lafyun.com/file/laf_preview_screens/ide.png"/></td>
     <td><img src="https://9b069020-06e3-4949-83d9-992a52ca99fe.lafyun.com/file/laf_preview_screens/files.png"/></td>
  </tr>
  <tr>
      <td width="50%" align="center"><b>Cloud Database</b></td>
      <td width="50%" align="center"><b>Application Management</b></td>
  </tr>
  <tr>
     <td><img src="https://9b069020-06e3-4949-83d9-992a52ca99fe.lafyun.com/file/laf_preview_screens/collection.png"/></td>
     <td><img src="https://9b069020-06e3-4949-83d9-992a52ca99fe.lafyun.com/file/laf_preview_screens/apps.png"/></td>
  </tr>
</table>

## 👨‍💻 Who is `laf` for?

1. **Front-end Developer** + `laf` = Full Stack Developer
   - `laf` privided [laf-client-sdk](https://github.com/labring/laf/tree/main/packages/client-sdk) for front-end which can be used in any JS runtime.
   - `laf` cloud function are developed using JS/TS, no need to learn any other languages.
   - `laf` provides static site hosting in one click, no more worries about server config, nginx, domain name, etc.
   - `laf` will provides more SDK in the future (Flutter/Android/iOS) to give you a unified experience on any platforms.
2. **Front-end Developer**, free you from all the trivia and configs, focus on the code itself!

   - `laf` saves you from tedious server admin/operation works.
   - `laf` saves you from boring `nginx` configs.
   - `laf` saves you from the hassle of manual DB deployment, security config.
   - `laf` saves you from the torment of 「10 min coding, 10 hour deploying」.
   - `laf` lets you inspect logs in the browser in any places at any time. No more SSH to the server!
   - `laf` lets you「write functions like blog」, just code and click to deploy!

3. **Cloud Native Developer**, get a more powerful, user-friendly and flexiable platform. No more contraints from **AWS** or **GCP**!

   - You can provide full source code to your clients which enables them to deploy the application in **any** environment.
   - You can modify/customize your cloud platform, `laf` is open-sourced and built with customization in mind.

4. **Node.js Developer**，`laf` is developed using `Node.js`, you can treat it as another **Node.js** framwork/platform.

   - You can write/debug/deploy your cloud functions in the browser with minimal effort.
   - You can inspect/search logs with no configuration needed.
   - No more hassle of DB/Storage/Nginx configuration, deploy your application at any time.
   - Make any `Node.js` code cloud-native (a crawler, a automatic script, etc), write code like writing a blog!

5. **Individual Developer & Startup Team**, reduce cost and start fast!
   - Reduce development time, shorten your product verfication cycle.
   - Be agile and adpat to the changing market.
   - Focus on your product, start fast and fail fast.
   - One developer + `laf` = A whole team.

> life is short, you need laf:)

## 💥 How can `laf` be used?

> `laf` is a back-end development platform which can theoretically support any kinds of application!

1. Develop Android, iOS or Web Application:

   - Use Cloud Function/DB/Storage for your product.
   - Deploy your admin front-end in `laf` with on click.
   - User Cloud Function for payment, authentication, hot-update, etc.

2. Deploy blog or homepage

   - For static blogs generated by vuepress/hexo/hugo, you can deploy them with `laf` in one click. (See [laf-cli](https://github.com/labring/laf-cli) for more info)
   - Use Cloud Function to handle comments, likes, statistics, etc.
   - Use Cloud Function to support features like online course/voting/survey/etc.
   - Use Cloud Function for crawling/live-feed/etc.
   - Use Cloud Storage for video/images/etc.

3. Enterprise Informatization: Deploy your own cloud platform.

   - Fast development/deployment of any internal systems.
   - Multi-tenancy/users/roles/apps support, segragate or connect different sectors/teams/apps.
   - Take advantage of the `laf` community, use and customize existing applications, save your budget!
   - Use free and open-source software, no litmitations, customize as you wish!

4. Handy toolkit for Individual Developers

   - `laf` makes any of your code cloud-native instantly.
   - Just like writing a note in your memo, but also auto synced to cloud and accessible from anywhere.
   - Make `laf` your notebook or "personal assitent", write a reminder app, email forwarding app, etc.

5. Other
   - Some use `laf` as a cloud drive.
   - Some use `laf` as a logging server for collection and analyzing data.
   - Some use `laf` as a crawler for latest news, etc.
   - Some use `laf` as a webhook for Github, Slack, Discord, etc.
   - Some use `laf` as a chaos-monkey for other services.
   - ...

> In the future, `lafyun.com` will have a `application market` where users can publish sample applications/templates!

## 🖥 Try it now

🎉 [lafyun.com](http://www.lafyun.com) is a `laf` service hosted by us, you can try `laf` for free!

Independent domain names and HTTPS licenses can be applied to your applications now, develop fast, and enjoy the freedom of `laf`!

## 🚀 Quick Start

[develop a register/login feature within 3 minutes](./quick-start.md)

## 🎉 Self-hosting

[self-hosting](./deploy/README.md)

## 🏘️ Community

- [Wechat Group](https://oss.lafyun.com/wofnib-image/2022-04-22-14-21-MRJH9o.png)
- [QQ Group：603059673](https://jq.qq.com/?_wv=1027&k=DdRCCiuz)
- _More community resources will be added soon!_

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lafjs/laf&type=Date)](https://star-history.com/#lafjs/laf&Date)
