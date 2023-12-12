import { DefaultTheme } from 'vitepress'


export const NavItemsInZh: DefaultTheme.NavItem[] = [
  { text: '主页', link: '/zh/' },
  { text: '示例', link: './markdown-examples' }
]

export const SidebarItemsInZh: DefaultTheme.SidebarItem[] = [
  {
    text: "介绍",
    items: [
      {
        text: "概览",
        link: "/zh/",
      },
      {
        text: "规格选择",
        link: "/zh/specification/",
      },
      {
        text: "Web IDE 在线开发",
        link: "/zh/web-ide/",
      },
    ],
  },
  {
    text: "快速开始",
    items: [
      {
        text: "三分钟实现「Todo List」",
        link: "/zh/quick-start/Todo",
      },
      {
        text: "三分钟实现「用户登录/注册」",
        link: "/zh/quick-start/login",
      },
    ],
  },
  {
    text: "云函数",
    collapsed: false,
    items: [
      {
        text: "云函数入门",
        link: "/zh/function/",
      },
      {
        text: "云函数用法",
        link: "/zh/function/use-function",
      },
      {
        text: "云函数 SDK",
        collapsed: false,
        items: [
          {
            text: "SDK 简介",
            link: "/zh/function/function-sdk#frontmatter-title",
          },
          {
            text: "导入 SDK",
            link: "/zh/function/function-sdk#导入-sdk",
          },
          {
            text: "发送网络请求",
            link: "/zh/function/function-sdk#发送网络请求",
          },
          {
            text: "操作数据库",
            link: "/zh/function/function-sdk#操作数据库",
          },
          {
            text: "云函数鉴权",
            link: "/zh/function/function-sdk#云函数鉴权",
          },
          {
            text: "云函数全局缓存",
            link: "/zh/function/function-sdk#云函数全局缓存",
          },
          {
            text: "原生 MongoDriver 实例",
            link: "/zh/function/function-sdk#云函数原生-mongodriverobject-实例",
          },
        ],
      },
      {
        text: "HTTP 调用云函数",
        link: "/zh/function/call-function-in-http",
      },
      {
        text: "函数市场",
        link: "/zh/function/function-market",
      },
      {
        text: "Laf Pilot",
        link: "/zh/function/pilot",
      },
      {
        text: "云函数日志",
        link: "/zh/function/logs",
      },
      {
        text: "依赖管理",
        link: "/zh/function/depend",
      },
      {
        text: "触发器",
        link: "/zh/function/trigger",
      },
      {
        text: "环境变量",
        link: "/zh/function/env",
      },
      {
        text: "WebSocket 连接",
        link: "/zh/function/websocket",
      },
      {
        text: "拦截器",
        link: "/zh/function/interceptor",
      },
      {
        text: "应用初始化",
        link: "/zh/function/init",
      },
      {
        text: "云函数 FAQ",
        link: "/zh/function/faq",
      },
    ],
  },
  {
    text: "云数据库",
    collapsed: false,
    items: [
      { text: "数据库简介", link: "/zh/db/" },
      { text: "数据库入门", link: "/zh/db/quickstart" },
      { text: "新增数据", link: "/zh/db/add" },
      { text: "查询数据", link: "/zh/db/find" },
      { text: "更新数据", link: "/zh/db/update" },
      { text: "删除数据", link: "/zh/db/del" },
      { text: "数据库操作符", link: "/zh/db/command" },
      { text: "数据库聚合操作", link: "/zh/db/aggregate" },
      { text: "数据库运算", link: "/zh/db/operator" },
      // {
      //   text: "操作地理信息",
      //   link: "/zh/db/geo",
      // },
    ],
  },
  {
    text: "云存储",
    collapsed: false,
    items: [
      { text: "云存储简介", link: "/zh/oss/" },
      { text: "云函数调用云存储", link: "/zh/oss/oss-by-function" },
      { text: "使用云函数生成上传和下载地址", link: "/zh/oss/gen-oss-url" },
      { text: "前端通过云函数上传文件", link: "/zh/oss/upload-by-function" },
      { text: "生成云存储临时令牌 (STS)", link: "/zh/oss/get-sts" },
      {
        text: "前端使用 STS 令牌上传文件",
        link: "/zh/oss/use-sts-in-client",
      },
    ],
  },
  {
    text: "静态网站托管",
    items: [{ text: "快速托管", link: "/zh/website-hosting/" }],
  },
  {
    text: "laf-cli 命令行工具",
    items: [{ text: "laf-cli 使用说明", link: "/zh/cli/" }],
  },
  {
    text: "客户端 SDK",
    items: [
      { text: "laf-client-sdk 使用说明", link: "/zh/client-sdk/" },
      { text: "数据库访问策略", link: "/zh/db/policy" },
    ],
  },
  {
    text: "VSCode 本地开发",
    items: [{ text: "laf assistant", link: "/zh/laf-assistant/" }],
  },
]