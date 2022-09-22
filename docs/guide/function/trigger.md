---
title: 云函数触发器
---

# {{ $frontmatter.title }}

触发器可按指定的条件，触发云函数的执行。

## 定时触发器

你可能需要定时执行一些任务， 云函数支持「定时触发器」来完成，在开发控制台给云函数添加一个定时触发器，并设置触发的间隔时间（单位:秒），即可定时触发云函数的执行。

> 具体请于开发控制台中操作。
> 注意: 在云函数列表点击顶部`发布函数`才会使触发器生效。（在云函数中的`发布`不会使触发器生效）

## 事件触发器

`laf.js` 支持事件触发器，监听内置事件、自定义事件。

- 内置事件

  - `App:ready` 应用启动就绪事件，云函数可监听此事件，完成一些初始化操作
  - `DatabaseChange:[集合名]#[操作]` 数据变更事件 ，当数据变化时触发，监听的数据变更操作可参考 [change-events](https://www.mongodb.com/docs/manual/reference/change-events/) ， 示例：

    - `DatabaseChange:users#insert` 当有新用户注册时触发
    - `DatabaseChange:orders#update` 当订单被更新时触发
    - `DatabaseChange:tasks#delete` 当任务被删除时触发

  - `WebSocket:connection` 有新 WebSocket 连接建立时触发，通过 `ctx.socket` 获取连接
  - `WebSocket:message` 接收 WebSocket 消息时触发，通过 `ctx.params` 获取消息数据
  - `WebSocket:close` 有 WebSocket 连接关闭时触发
  - `WebSocket:error` 有 WebSocket 连接出错时触发

- 自定义事件
  - 用户可在云函数中触发自定义事件，如在登陆函数中调用：
    ```ts
    import cloud from "@/cloud-sdk";
    exports.main = async function (ctx) {
      // do user login
      cloud.emit("login-success", user);
    };
    ```
  - 然后在另一个云函数中添加事件触发器，监听 `login-success` 事件，当有用户登陆登陆成功时则会自动触发此函数。
    开发者可在此函数中完成一些关于用户登陆的逻辑，如「首次登陆送优惠券」「每日登陆加积分」「异常登陆发送短信通知」「用户行为监测记录」等
