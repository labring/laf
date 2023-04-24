import { defineConfig, DefaultTheme } from "vitepress";
import mdItCustomAttrs from "markdown-it-custom-attrs";

/**
 * @type {DefaultTheme.NavItem[]}
 */
const NavConfig = [
  { text: "主页", link: "https://laf.run" },
  { text: "开发指南", link: "/guide/", activeMatch: "^/guide/" },
  { text: "API", link: "/api/cloud", activeMatch: "^/api/" },
  { text: "范例", link: "/examples/aliyun-sms", activeMatch: "^/examples/" },
  { text: "预览图", link: "/screenshots" },
  {
    text: "立即使用",
    // target: "_self",
    link: "https://laf.run/",
  },
];

/**
 * @type {DefaultTheme.MultiSideBarConfig}
 */
const guideSiderbarConfig = [
  {
    text: "介绍",
    items: [
      {
        text: "概览",
        link: "/guide/",
      },
    ],
  },
  {
    text: "快速开始",
    items: [
      {
        text: "三分钟实现「Todo List」",
        link: "/guide/quick-start/Todo",
      },
      {
        text: "三分钟实现「用户登录/注册」",
        link: "/guide/quick-start/login",
      },
    ],
  },
  {
    text: "云函数",
    items: [
      {
        text: "云函数入门",
        link: "/guide/function/",
      },
      {
        text: "云函数用法",
        link: "/guide/function/use-function",
      },
      {
        text: "调用云函数",
        items: [
          {
            text: "在客户端中调用",
            link: "/guide/function/call-function-in-client",
          },
          {
            text: "在云函数中调用",
            link: "/guide/function/call-function",
          },
          {
            text: "HTTP调用",
            link: "/guide/function/call-function-in-http",
          },
        ],
      },
      {
        text: "云函数日志",
        link: "/guide/function/logs",
      },
      {
        text: "依赖管理",
        link: "/guide/function/depend",
      },
      {
        text: "触发器",
        link: "/guide/function/trigger",
      },
      {
        text: "环境变量",
        link: "/guide/function/env",
      },
      {
        text: "WebSocket 连接",
        link: "/guide/function/websocket",
      },
      {
        text: "拦截器",
        link: "/guide/function/interceptor",
      },
      {
        text: "云函数FAQ",
        link: "/guide/function/faq",
      },
    ],
  },
  {
    text: "云数据库",
    items: [
      { text: "数据库简介", link: "/guide/db/" },
      { text: "数据库入门", link: "/guide/db/quickstart" },
      { text: "新增数据", link: "/guide/db/add" },
      { text: "查询数据", link: "/guide/db/find" },
      { text: "更新数据", link: "/guide/db/update" },
      { text: "删除数据", link: "/guide/db/del" },
      { text: "数据库操作符", link: "/guide/db/command" },
      { text: "数据库聚合操作", link: "/guide/db/aggregate" },
      {
        text: "操作地理信息",
        link: "/guide/db/geo",
      },
    ],
  },
  {
    text: "云存储",
    items: [
      { text: "云存储简介", link: "/guide/oss/" },
      { text: "生成云存储临时令牌(STS)", link: "/guide/oss/get-sts" },
      {
        text: "前端使用 STS 令牌上传文件",
        link: "/guide/oss/use-sts-in-client",
      },
    ],
  },
  {
    text: "静态网站托管",
    items: [
      { text: "快速开始", link: "/guide/website-hosting/" },
      // { text: "快速开始", link: "/guide/website-hosting/quick-start" },
    ],
  },
  {
    text: "laf-cli 命令行工具",
    items: [{ text: "laf-cli 使用说明", link: "/guide/cli/" }],
  },
  {
    text: "客户端 SDK",
    items: [
      { text: "laf-client-sdk 使用说明", link: "/guide/client-sdk/" },
      { text: "数据库访问策略", link: "/guide/db/policy" },
    ],
  },
];

/**
 * @type {DefaultTheme.MultiSideBarConfig}
 */
const apiSideBarConfig = [
  {
    text: "云函数",
    items: [
      {
        text: "Cloud SDK",
        link: "/api/cloud",
      },
    ],
  },
];

/**
 * @type {DefaultTheme.MultiSideBarConfig}
 */
const examplesSideBarConfig = [
  {
    text: "云函数",
    items: [
      {
        text: "阿里云短信发送函数",
        link: "/examples/aliyun-sms",
      },
      {
        text: "实现微信支付功能",
        link: "/examples/wechat-pay",
      },
      {
        text: "实现支付宝支付功能",
        link: "/examples/alipay-pay",
      },
      {
        text: "使用 WebSocket 长连接",
        link: "/examples/websocket",
      },
      {
        text: "使用 SMTP 服务发送邮件",
        link: "/examples/send-mail",
      },
    ],
  },
  {
    text: "前端应用",
    items: [{ text: "Todo List", link: "/examples/todo-list" }],
  },
];

export default defineConfig({
  lang: "zh-CN",
  title: "laf 云开发",
  description: "laf 云开发，像写博客一样写函数，随手上线",
  markdown: {
    lineNumbers: true,
    config: (md) => {
      // use more markdown-it plugins!
      md.use(mdItCustomAttrs, "image", {
        "data-fancybox": "gallery",
      });
    },
  },
  themeConfig: {
    logo: "/logo.png",
    repo: "labring/laf",
    docsBranch: "main",
    docsDir: "docs",
    footer: {
      message: "Apache License V2.0",
      copyright: "Copyright © 2021-present labring/laf",
    },
    // editLink: {
    //   pattern: "https://github.com/labring/laf/edit/main/docs/:path",
    //   text: "在 GitHub 上编辑此页",
    // },
    lastUpdated: "更新于",
    nav: NavConfig,
    socialLinks: [{ icon: "github", link: "https://github.com/labring/laf" }],
    sidebar: {
      "/guide/": guideSiderbarConfig,
      "/api/": apiSideBarConfig,
      "/examples/": examplesSideBarConfig,
    },
  },
  head: [
    [
      "link",
      {
        rel: "stylesheet",
        href: "/fancybox.css",
      },
    ],
    [
      "script",
      {
        src: "/fancybox.umd.js",
      },
    ],
  ],
});
