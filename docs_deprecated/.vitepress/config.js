import { defineConfig, DefaultTheme } from "vitepress";
import mdItCustomAttrs from "markdown-it-custom-attrs";
import {
  guideSiderbarConfig_en,
  examplesSideBarConfig_en,
  NavConfig_en,
} from "./en";

/**
 * @type {DefaultTheme.NavItem[]}
 */
const NavConfig = [
  { text: "主页", link: "https://laf.run" },
  {
    text: "开发指南",
    activeMatch: "^/guide/",
    items: [
      {
        text: "入门",
        items: [
          {
            text: "Laf 云开发介绍",
            link: "/guide/",
          },
          {
            text: "Web IDE",
            link: "/guide/web-ide/",
          },
        ],
      },
      {
        text: "功能",
        items: [
          {
            text: "云函数",
            link: "/guide/function/",
          },
          {
            text: "云数据库",
            link: "/guide/db/",
          },
          {
            text: "云存储",
            link: "/guide/oss/",
          },
        ],
      },
      {
        text: "更多",
        items: [
          {
            text: "网站托管",
            link: "/guide/website-hosting/",
          },
          {
            text: "客户端 SDK",
            link: "/guide/client-sdk/",
          },
          {
            text: "命令行工具",
            link: "/guide/cli/",
          },
          {
            text: "VSCode 本地开发",
            link: "/guide/laf-assistant/",
          },
        ],
      },
    ],
  },
  {
    text: "三分钟实验室",
    link: "/3min/",
  },
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
      {
        text: "规格选择",
        link: "/guide/specification/",
      },
      {
        text: "Web IDE 在线开发",
        link: "/guide/web-ide/",
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
    collapsed: false,
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
        text: "云函数 SDK",
        collapsed: false,
        items: [
          {
            text: "SDK 简介",
            link: "/guide/function/function-sdk#frontmatter-title",
          },
          {
            text: "导入 SDK",
            link: "/guide/function/function-sdk#导入-sdk",
          },
          {
            text: "发送网络请求",
            link: "/guide/function/function-sdk#发送网络请求",
          },
          {
            text: "操作数据库",
            link: "/guide/function/function-sdk#操作数据库",
          },
          {
            text: "云函数鉴权",
            link: "/guide/function/function-sdk#云函数鉴权",
          },
          {
            text: "云函数全局缓存",
            link: "/guide/function/function-sdk#云函数全局缓存",
          },
          {
            text: "原生 MongoDriver 实例",
            link: "/guide/function/function-sdk#云函数原生-mongodriverobject-实例",
          },
        ],
      },
      {
        text: "HTTP 调用云函数",
        link: "/guide/function/call-function-in-http",
      },
      {
        text: "函数市场",
        link: "/guide/function/function-market",
      },
      {
        text: "Laf Pilot",
        link: "/guide/function/pilot",
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
        text: "应用初始化",
        link: "/guide/function/init",
      },
      {
        text: "云函数 FAQ",
        link: "/guide/function/faq",
      },
    ],
  },
  {
    text: "云数据库",
    collapsed: false,
    items: [
      { text: "数据库简介", link: "/guide/db/" },
      { text: "数据库入门", link: "/guide/db/quickstart" },
      { text: "新增数据", link: "/guide/db/add" },
      { text: "查询数据", link: "/guide/db/find" },
      { text: "更新数据", link: "/guide/db/update" },
      { text: "删除数据", link: "/guide/db/del" },
      { text: "数据库操作符", link: "/guide/db/command" },
      { text: "数据库聚合操作", link: "/guide/db/aggregate" },
      { text: "数据库运算", link: "/guide/db/operator" },
      // {
      //   text: "操作地理信息",
      //   link: "/guide/db/geo",
      // },
    ],
  },
  {
    text: "云存储",
    collapsed: false,
    items: [
      { text: "云存储简介", link: "/guide/oss/" },
      { text: "云函数调用云存储", link: "/guide/oss/oss-by-function" },
      { text: "使用云函数生成上传和下载地址", link: "/guide/oss/gen-oss-url" },
      { text: "前端通过云函数上传文件", link: "/guide/oss/upload-by-function" },
      { text: "生成云存储临时令牌 (STS)", link: "/guide/oss/get-sts" },
      {
        text: "前端使用 STS 令牌上传文件",
        link: "/guide/oss/use-sts-in-client",
      },
    ],
  },
  {
    text: "静态网站托管",
    items: [{ text: "快速托管", link: "/guide/website-hosting/" }],
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
  {
    text: "VSCode 本地开发",
    items: [{ text: "laf assistant", link: "/guide/laf-assistant/" }],
  },
];

/**
 * @type {DefaultTheme.MultiSideBarConfig}
 */
const examplesSideBarConfig = [
  {
    text: "3 分钟实验室",
    items: [
      {
        text: "介绍",
        link: "/3min/",
      },
    ],
  },
  {
    text: "接入微信",
    items: [
      {
        text: "微信公众号",
        items: [
          {
            text: "服务器对接及文本消息",
            link: "/3min/wechat/MediaPlatform/ServerDocking.md",
          },
          {
            text: "自定义菜单",
            link: "/3min/wechat/MediaPlatform/Menu.md",
          },
          {
            text: "H5 开发",
            link: "/3min/wechat/MediaPlatform/H5.md",
          },
        ],
      },
      {
        text: "微信小程序",
        link: "/3min/wechat/MiniProgram/",
      },
      {
        text: "企业微信",
        link: "/3min/wechat/CorporateWeChat/",
      },
    ],
  },
  {
    text: "接入 AI",
    items: [
      {
        text: "接入 ChatGPT",
        link: "/3min/chatgpt/",
      },
      {
        text: "接入 Claude",
        link: "/3min/claude/",
      },
      {
        text: "接入 Midjourney",
        link: "/3min/midjourney/",
      },
    ],
  },
];

export default defineConfig({
  base: '/old',
  locales: {
    root: {
      label: "简体中文",
      lang: "zh-CN",
      link: "/",
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
        editLink: {
          pattern: "https://github.com/labring/laf/edit/main/docs/:path",
          text: "在 GitHub 上编辑此页",
        },
        lastUpdated: "更新于",
        nav: NavConfig,
        socialLinks: [
          { icon: "github", link: "https://github.com/labring/laf" },
          { icon: "discord", link: "https://discord.gg/KaxHF86CcF" },
          { icon: "twitter", link: "https://twitter.com/laf_dev" },
        ],
        sidebar: {
          "/guide/": guideSiderbarConfig,
          "/3min/": examplesSideBarConfig,
        },
      },
      head: [
        ["link", { rel: "icon", href: "/logo.png" }],
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
    },
    en: {
      label: "English",
      lang: "en",
      link: "/en/",
      title: "laf Cloud Development",
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
        editLink: {
          pattern: "https://github.com/labring/laf/edit/main/docs/:path",
          text: "Edited this page on github",
        },
        lastUpdated: "Update time",
        nav: NavConfig_en,
        socialLinks: [
          { icon: "github", link: "https://github.com/labring/laf" },
          { icon: "discord", link: "https://discord.gg/KaxHF86CcF" },
          { icon: "twitter", link: "https://twitter.com/laf_dev" },
        ],
        sidebar: {
          "/en/guide/": guideSiderbarConfig_en,
          "/en/3min/": examplesSideBarConfig_en,
        },
      },
      head: [
        ["link", { rel: "icon", href: "/logo.png" }],
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
    },
  },
});
