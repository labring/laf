![laf](https://socialify.git.ci/lafjs/laf/image?description=1&descriptionEditable=laf.js%20%E8%AE%A9%E6%AF%8F%E4%B8%AA%E5%BC%80%E5%8F%91%E5%9B%A2%E9%98%9F%E9%83%BD%E5%8F%AF%E4%BB%A5%E9%9A%8F%E6%97%B6%E6%8B%A5%E6%9C%89%E4%B8%80%E4%B8%AA%E8%87%AA%E5%B7%B1%E7%9A%84%E4%BA%91%E5%BC%80%E5%8F%91%E5%B9%B3%E5%8F%B0%EF%BC%81&font=Raleway&forks=1&language=1&name=1&owner=1&pattern=Circuit%20Board&stargazers=1&theme=Dark)

<div align="center">
  <p>
    <b>一套开箱即用、完整、开源、为开发者提供的基于 Serverless 模式和 JS 编程的云开发框架</b>
  </p>

  <p>
    
  [![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/lafjs/laf)
  [![](https://img.shields.io/docker/pulls/lafyun/system-server)](https://hub.docker.com/r/lafyun/system-server)
  ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?logo=typescript&logoColor=white)
  [![Website](https://img.shields.io/website?url=https%3A%2F%2Fdocs.lafyun.com&logo=Postwoman)](https://docs.lafyun.com/)
  <a href="https://cdn.jsdelivr.net/gh/yangchuansheng/imghosting3@main/uPic/2022-04-22-14-21-MRJH9o.png"><img src="https://img.shields.io/badge/%E5%BE%AE%E4%BF%A1%E7%BE%A4-2000%2B-brightgreen"></a>

  </p>
</div>

## 👀 Laf 是什么

`laf.js` 是一套开箱即用、完整、开源、为开发者提供的基于 Serverless 模式和 JS 编程的云开发框架。

用熟悉的 JS，轻松搞定前后台整体业务，前端秒变全栈。

[`laf.js`](https://github.com/lafjs/laf) 让每个开发团队都可以随时拥有一个自己的云开发平台！

可以通过下面的屏幕截图进一步了解 Laf，关于 Laf 更详细的介绍与说明请参阅 [laf.js 云开发文档](https://docs.lafyun.com/guide/)

<table>
  <tr>
      <td width="50%" align="center"><b>云函数</b></td>
      <td width="50%" align="center"><b>云存储</b></td>
  </tr>
  <tr>
     <td><img src="https://9b069020-06e3-4949-83d9-992a52ca99fe.lafyun.com/file/laf_preview_screens/ide.png"/></td>
     <td><img src="https://9b069020-06e3-4949-83d9-992a52ca99fe.lafyun.com/file/laf_preview_screens/files.png"/></td>
  </tr>
  <tr>
      <td width="50%" align="center"><b>云数据库：数据管理</b></td>
      <td width="50%" align="center"><b>应用列表</b></td>
  </tr>
  <tr>
     <td><img src="https://9b069020-06e3-4949-83d9-992a52ca99fe.lafyun.com/file/laf_preview_screens/collection.png"/></td>
     <td><img src="https://9b069020-06e3-4949-83d9-992a52ca99fe.lafyun.com/file/laf_preview_screens/apps.png"/></td>
  </tr>
</table>

### 使用案例

- [bytepay](https://bytepay.online) 是一款基于区块链的开源付费协作平台，web3基金会孵化项目，完全基于laf开发。
- [sealos商城](https://sealyun.com) 是[sealos](https://github.com/labring/sealos) 的官方商城，基于laf开发，发票/支付/短信/对象存储 等功能都能很好支持，目前该网站服务数千企业用户。
- 国牧花园 微信小程序，是精品猪肉电商网站，完全基于laf开发，支持支付/物流/短信等功能, laf自带https极大程度方便了应用。

laf已经实际应用到数十款SaaS应用中，成熟稳定简单，减少了60%以上研发工作量，且不再需要专业的后端人员配合，运维上线等流程更是优化到0，是SaaS应用开发的明智之选。低耦合，函数可脱离框架单独运行。

## 🖥 在线体验

🎉 [lafyun.com](http://www.lafyun.com) 正式上线！可直接在线体验，[立即创建](http://www.lafyun.com) Laf 云开发应用服务！

开发者可免费在 [lafyun.com](http://www.lafyun.com) 上快速创建自己的应用，不用关心服务器部署和运维工作，立即拥有应用独立域名及 HTTPS 证书，快速上线应用！

开发者可以在私有服务器上部署一套 Laf 云开发平台，可方便的将 [lafyun.com](http://www.lafyun.com) 中的应用迁至自己的 Laf 云开发平台中运行！

## ✅ 主要功能


- 提供云函数引擎、文件存储、数据访问策略、触发器、WebSocket 等能力，开箱即用，5 分钟上线应用，前端秒变全栈。
- 前端可使用 [laf-client-sdk](https://github.com/lafjs/laf/tree/main/packages/client-sdk) “直连”数据库，无需与服务端对接口。
- 支持 H5、小程序、Uni-app、Flutter 等客户端环境使用。
- 提供云开发控制台，在线管理云函数、文件、数据库、远程部署、日志，在线编写、调试云函数，全智能提示 IDE。

## 💥 适用场景

- 快速构建小程序，如电商，企业各类管理系统等SaaS类应用。
- 用于快速开发 MVP，专注于客户端业务，极大程度减少服务端开发工作量。
- 自建属于自己可控的云开发平台。

## 👨‍💻 适用人群

### 云开发用户

如果你喜欢微信云开发的极速体验，但又不想局限于微信等具体平台的限制，那么可以基于 `Laf` 搭建属于自己的云开发平台。

- `laf.js` 也是当前已知的唯一的开源云开发平台，技术选型更自信、风险更可控、场景更易扩展；
- 自建云开发，可以获取极速的云开发体验，同时没有技术选型时迁移平台的烦恼顾虑。

### 个人开发者、初创创业团队

在产品初期基于 `laf.js` 可以极大减少服务端 API 的数量；

根据我们的实践经验，初期能节约 90% 的服务端 API；

专注于产品业务本身，快速推出最小可用产品(MVP)，快速进行产品、市场验证。

### 软件开发商

将无需雇佣 PHP 或 Java 等服务器工程师，开发成本大幅下降；

开发效率大幅提升、上线和迭代速度大幅提速；

可完整交付整个云开发框架源码，私网部署。

## 🚀 快速开始

[安装教程](./docs/guide/function/install.md)

## 🏘️ 社群

+ [微信群](https://cdn.jsdelivr.net/gh/yangchuansheng/imghosting3@main/uPic/2022-04-22-14-21-MRJH9o.png)
+ QQ 群：603059673

先run system-client 在 run app-console