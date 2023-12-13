import { DefaultTheme } from 'vitepress'


export const NavItemsInZh: DefaultTheme.NavItem[] = [
  { text: '开发指南', link: '/zh/' },
  {
    text: '使用实例', link: '/zh/examples/'
  }
]

export const SidebarItemsInZh: DefaultTheme.SidebarItem[] = [
  {
    text: "入门",
    link: '/zh/',
    items: [
      {
        text: "laf 介绍",
        link: "/zh/",
      },
      {
        text: '快速开始',
        link: '/zh/quick-start/login'
      }
    ],
  },
  {
    text: "云函数",
    collapsed: false,
    items: [
      {
        text: "云函数入门",
        link: "/zh/cloud-function/",
      },
      {
        text: "云函数用法",
        link: "/zh/cloud-function/use-function",
      },
      {
        text: "云函数 SDK",
        collapsed: true,
        items: [
          {
            text: "SDK 简介",
            link: "/zh/cloud-function/function-sdk#frontmatter-title",
          },
          {
            text: "导入 SDK",
            link: "/zh/cloud-function/function-sdk#导入-sdk",
          },
          {
            text: "发送网络请求",
            link: "/zh/cloud-function/function-sdk#发送网络请求",
          },
          {
            text: "操作数据库",
            link: "/zh/cloud-function/function-sdk#操作数据库",
          },
          {
            text: "云函数鉴权",
            link: "/zh/cloud-function/function-sdk#云函数鉴权",
          },
          {
            text: "云函数全局缓存",
            link: "/zh/cloud-function/function-sdk#云函数全局缓存",
          },
          {
            text: "原生 MongoDriver 实例",
            link: "/zh/cloud-function/function-sdk#云函数原生-mongodriverobject-实例",
          },
        ],
      },
      {
        text: "HTTP 调用云函数",
        link: "/zh/cloud-function/call-function-in-http",
      },
      {
        text: "函数市场",
        link: "/zh/cloud-function/function-market",
      },
      {
        text: "Laf Pilot",
        link: "/zh/cloud-function/pilot",
      },
      {
        text: "云函数日志",
        link: "/zh/cloud-function/logs",
      },
      {
        text: "依赖管理",
        link: "/zh/cloud-function/depend",
      },
      {
        text: "触发器",
        link: "/zh/cloud-function/trigger",
      },
      {
        text: "环境变量",
        link: "/zh/cloud-function/env",
      },
      {
        text: "WebSocket 连接",
        link: "/zh/cloud-function/websocket",
      },
      {
        text: "拦截器",
        link: "/zh/cloud-function/interceptor",
      },
      {
        text: "应用初始化",
        link: "/zh/cloud-function/init",
      },
      {
        text: "云函数 FAQ",
        link: "/zh/cloud-function/faq",
      },
    ],
  },
  {
    text: "云数据库",
    collapsed: false,
    items: [
      { text: "数据库简介", link: "/zh/cloud-database/" },
      { text: "数据库入门", link: "/zh/cloud-database/quickstart" },
      { text: "新增数据", link: "/zh/cloud-database/add" },
      { text: "查询数据", link: "/zh/cloud-database/find" },
      { text: "更新数据", link: "/zh/cloud-database/update" },
      { text: "删除数据", link: "/zh/cloud-database/del" },
      { text: "数据库操作符", link: "/zh/cloud-database/command" },
      { text: "数据库聚合操作", link: "/zh/cloud-database/aggregate" },
      { text: "数据库运算", link: "/zh/cloud-database/operator" },
      // {
      //   text: "操作地理信息",
      //   link: "/zh/cloud-database/geo",
      // },
    ],
  },
  {
    text: "云存储",
    collapsed: false,
    items: [
      { text: "云存储简介", link: "/zh/cloud-storage/" },
      { text: '上传文件', link: '/zh/cloud-storage/upload' },
      { text: '读取文件', link: '/zh/cloud-storage/read' },
      { text: '删除文件', link: '/zh/cloud-storage/delete' },
      { text: '获取文件列表', link: '/zh/cloud-storage/list' },
      { text: '生成文件上传地址', link: '/zh/cloud-storage/gen-upload-url' },
      { text: '生成文件下载地址', link: '/zh/cloud-storage/gen-download-url' },
      { text: "网站托管", link: "/zh/cloud-storage/website-hosting" },
      {
        text: '更多例子',
        collapsed: true,
        items: [
          { text: "微信小程序上传文件", link: "/zh/examples/wxmp-upload" },
          { text: 'Web 前端上传文件(TBD)' },
          { text: '微信小程序上传文件(TBD)' },
        ]
      }
    ],
  },
  {
    text: "laf-cli 命令行工具",
    items: [{ text: "laf-cli 使用说明", link: "/zh/cli/" }],
  },
  {
    text: "客户端 SDK",
    items: [
      { text: "laf-client-sdk 使用说明", link: "/zh/client-sdk/" },
      { text: "数据库访问策略", link: "/zh/cloud-database/policy" },
    ],
  },
  {
    text: "VSCode 本地开发",
    items: [{ text: "laf assistant", link: "/zh/laf-assistant/" }],
  },
]