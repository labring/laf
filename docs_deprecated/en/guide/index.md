---
title: Introduction
---

# {{ $frontmatter.title }}

## 👀 What is `laf`

- `laf` is a cloud development platform that allows for rapid application development.
- `laf` is an open-source Backend as a Service (BaaS) development platform.
- `laf` is an out-of-the-box serverless development platform.
- `laf` combines functions computing, database, and object storage into one integrated development platform.
- `laf` can be seen as an open-source version of Tencent Cloud Development, Google Firebase, or UniCloud.

[`laf`](https://github.com/labring/laf) enables every development team to have their own cloud development platform!

## 🎉 What does `laf` offer

- Multi-application management: create and start/stop applications without the need for server configuration. Get your application online in just one minute.
- Cloud functions: `laf` provides function computing services to quickly implement backend business logic.
- Cloud database: provides ready-to-use database services for application development.
- Cloud storage: offers professional file object storage services compatible with S3 and other storage service interfaces.
- WebIDE: write code online with comprehensive type hints and code auto-completion. Write functions just like writing a blog post and publish them instantly.
- Static hosting: supports hosting static websites, allowing for quick deployment without the need for configuring nginx.
- Client Db: supports clients using [laf-client-sdk](https://github.com/labring/laf/tree/main/packages/client-sdk) to "directly connect" to the database. Access control through access policies greatly enhances application development efficiency.
- WebSocket: supports long-lived connections, leaving no blind spots in business processes.

Further understand `laf` through the following screenshots:

<table>
  <tr>
      <td width="50%" align="center"><b>Cloud Functions</b></td>
      <td width="50%" align="center"><b>Cloud Storage</b></td>
  </tr>
  <tr>
     <td><img src="../doc-images/function.png"/></td>
     <td><img src="../doc-images/file.png"/></td>
  </tr>
  <tr>
      <td width="50%" align="center"><b>Cloud Database: Data Management</b></td>
      <td width="50%" align="center"><b>Application List</b></td>
  </tr>
  <tr>
     <td><img src="../doc-images/db.png"/></td>
     <td><img src="../doc-images/appList.png"/></td>
  </tr>
</table>

## 👨‍💻 Who should use `laf`?

1. Front-end developers + `laf` = full-stack developers. Front-end developers can become true full-stack developers with `laf`.

   - `laf` provides [laf-client-sdk](https://github.com/labring/laf/tree/main/packages/client-sdk) for front-end developers, which is suitable for any JS runtime environment.
   - `laf` utilizes JS/TS for cloud functions development, allowing seamless integration of front-end and back-end code without barriers.
   - `laf` offers static website hosting, allowing direct deployment of web pages built by front-end developers without the need for server, nginx, or domain configuration.
   - `laf` will provide various SDKs for different clients (e.g., Flutter/Android/iOS), providing backend development services and a consistent development experience for all client developers.

2. Backend developers can free themselves from mundane tasks and focus on business logic to improve development efficiency.

   - `laf` saves effort in server maintenance, multi-environment deployment, and management.
   - `laf` eliminates the need for configuring and debugging nginx.
   - `laf` eliminates repetitive work such as manually deploying databases and addressing security concerns for each project.
   - `laf` streamlines the iterative experience, avoiding the hassle of spending half a day for every modification and release.
   - `laf` allows you to view function runtime logs on the web anytime, anywhere, without the need to connect to servers or search through logs.
   - `laf` enables you to "write a function like writing a blog post," making it easy to publish with just a few clicks.

3. Users of cloud development platforms, especially those using WeChat cloud development. With `laf`, you can enjoy a more powerful and faster development experience without being locked into WeChat's cloud development platform.

   - You can deliver source code to clients, allowing them to privately deploy a `laf` + your cloud development application. Closed-source cloud development services cannot provide independently runnable source code.
   - You can deploy your own products to your own servers at any time in the future since `laf` is open-source and free.
   - You can modify and customize your own cloud development platform as `laf` is open-source and highly scalable.

4. Node.js developers: `laf` is developed using Node.js, so you can consider it as a more convenient Node.js development platform or framework.

   - You can write and debug functions online without restarting the service. Publish with just one click.
   - You can view and search for function call logs online.
   - You don't have to worry about setting up databases, object storage, or nginx. Get your application online anytime, anywhere.
   - You can easily deploy a piece of Node.js code to the cloud, such as a web crawler or monitoring code. Write Node.js like writing a blog!

5. Independent developers and startup teams can save costs, start quickly, and focus on their business.

   - Reduce the project development process to quickly start and shorten the product validation cycle.
   - Greatly increase iteration speed, adapt to changes at any time, and publish instantly.
   - Focus on the core product business, quickly launch a minimum viable product (MVP), and conduct rapid product and market validation.
   - One person + `laf` = a team

> Life is short, you need laf :)

## 💥 What can be done with laf

> `laf` is a backend development platform for applications and theoretically can be used for any type of application!

1. Quickly develop WeChat mini-programs/public accounts using laf: e-commerce, social networking, utilities, education, finance, games, short videos, communities, enterprises, and more!

   - WeChat mini-programs require HTTPS access, and you can directly use [laf.run](https://laf.run) to create an application that provides HTTPS interface services for mini-programs.
   - You can deploy the H5 pages and admin portal directly to be statically hosted by `laf`.
   - Host H5 directly on `laf` and configure the assigned domain name in the public account for online access.
   - Use cloud functions to implement WeChat authorization, payment, and other services.
   - Use cloud storage to store user data such as videos and avatars.

2. Develop Android or iOS applications using laf.

   - Use cloud functions, cloud databases, and cloud storage for business processing.
   - Deploy the backend management (admin) of the application to be statically hosted by `laf`.
   - Use cloud functions to implement WeChat authorization, payment, hot updates, and other features.

3. Deploy personal blogs and corporate websites.

   - Deploy static-generated blogs such as vuepress / hexo / hugo to `laf` static hosting with one click, see [laf-cli](https://github.com/labring/laf/tree/main/cli).
   - Use cloud functions to handle user messages, comments, access statistics, and more.
   - Use cloud functions to extend other capabilities of the blog, such as courses, voting, questions, etc.
   - Use cloud storage to store videos, images.
   - Use cloud functions for web scraping, push notifications, and other functionalities.

4. Enterprise information construction: Private deployment of a `laf` cloud development platform for enterprises.

   - Quickly develop internal information systems for enterprises, with quick online, modification, and iteration to reduce costs.
   - Supports multiple applications and accounts, allowing for isolation and connectivity between different departments and systems.
   - Take advantage of the `laf` community ecosystem and directly use existing `laf` applications out-of-the-box to reduce costs.
   - `laf` is open source and free, without concerns about technology lock-in, allowing for customization and freedom of use.

5. "Cloud at Hand" for individual developers.

   - `laf` allows developers to easily deploy code to the cloud.
   - Just like typing a piece of text in the notes on your phone, it automatically syncs to the cloud and can be accessed and executed by anyone on the internet.
   - `laf` is every developer's "scratch pad," where you can write a function like taking notes.
   - `laf` is every developer's personal assistant, allowing you to write functions such as sending scheduled SMS or email notifications at any time.

6. Others
   - Some users use `laf` cloud storage as a personal cloud drive.
   - Some users use `laf` applications as a log server, collecting client-side log data and using cloud functions for analysis and statistics.
   - Some users use `laf` for running web scraping, capturing third-party news and information content.
   - Some users use `laf` cloud functions as webhooks, listening to Git repository commit messages and pushing them to DingTalk or WeChat Work groups.
   - Some users use `laf` cloud functions for monitoring, regularly checking the health status of online services.
   - ...

## 🏘️ Community

- [Forum](https://forum.laf.run/)
- [WeChat Group](https://cdn.jsdelivr.net/gh/yangchuansheng/imghosting3@main/uPic/2022-04-22-14-21-MRJH9o.png)
- QQ Group: `603059673`
- Official WeChat Account: `laf-dev`