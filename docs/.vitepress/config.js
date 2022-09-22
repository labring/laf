import { defineConfig, DefaultTheme } from 'vitepress'


/**
 * @type {DefaultTheme.NavItem[]}
 */
const NavConfig = [
  { text: '主页', link: '/' },
  { text: '开发指南', link: '/guide/', activeMatch: '^/guide/' },
  { text: 'API', link: '/api/cloud', activeMatch: '^/api/' },
  { text: '范例', link: '/examples/aliyun-sms', activeMatch: '^/examples/' },
  { text: '预览图', link: '/screenshots', },
  {
    text: '在线体验',
    // target: "_self",
    link: 'https://console.lafyun.com/'
  }
]

/**
 * @type {DefaultTheme.MultiSideBarConfig}
 */
const guideSiderbarConfig = [
  {
    text: '介绍',
    items: [
      {
        text: '概览',
        link: '/guide/',
      },
      {
        text: '快速开始',
        link: '/guide/quick-start/',
      },
    ]
  },
  {
    text: '云函数',
    items: [
      { text: '云函数入门', link: '/guide/function/' },
      {
        text: '触发器',
        link: '/guide/function/trigger',
      },
      {
        text: 'WebSocket 连接',
        link: '/guide/function/websocket',
      },
    ]
  },
  {
    text: '云数据库',
    items: [
      { text: '云数据库简介', link: '/guide/db/' },
      { text: '访问策略', link: '/guide/db/policy' },
      { text: '数据操作', link: '/guide/db/actions' },
      { text: '数据查询', link: '/guide/db/query' },
      {
        text: '操作地理信息',
        link: '/guide/db/geo'
      }
    ]
  },
  {
    text: '云存储',
    items: [
      { text: '云存储简介', link: '/guide/oss/' },
      { text: '生成云存储临时令牌(STS)', link: '/guide/oss/get-sts' },
      { text: '前端使用 STS 令牌上传文件', link: '/guide/oss/use-sts-in-client' },
    ]
  },
  {
    text: '静态网站托管',
    items: [
      { text: '静态托管简介', link: '/guide/website-hosting/' },
      { text: '快速开始', link: '/guide/website-hosting/quick-start' },
    ]
  },
  {
    text: 'laf-cli 命令行工具',
    items: [
      { text: 'laf-cli 使用说明', link: '/guide/cli/' },
    ]
  },
  {
    text: '私有化部署',
    items: [
      {
        text: '在Docker上部署',
        link: '/guide/deploy/docker',
      }
    ]
  }
]

/**
 * @type {DefaultTheme.MultiSideBarConfig}
 */
const apiSideBarConfig = [
  {
    text: '云函数',
    items: [
      {
        text: 'Cloud SDK',
        link: '/api/cloud'
      }
    ]
  }
]

/**
 * @type {DefaultTheme.MultiSideBarConfig}
 */
const examplesSideBarConfig = [
  {
    text: '云函数',
    items: [
      {
        text: '阿里云短信发送函数',
        link: '/examples/aliyun-sms',
      },
      {
        text: '实现微信支付功能',
        link: '/examples/wechat-pay'
      },
      {
        text: '实现支付宝支付功能',
        link: '/examples/alipay-pay'
      },
      {
        text: '使用 WebSocket 长连接',
        link: '/examples/websocket'
      },
    ]
  }, {
    text: '前端应用',
    items: [
      { text: 'ToDo Lost', link: '/examples/todo-list', },
    ]
  }
]

export default defineConfig({
  lang: 'zh-CN',
  title: 'laf 云开发',
  description: 'laf 云开发，像写博客一样写函数，随手上线',
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    logo: '/logo.png',
    repo: 'labring/laf',
    docsBranch: 'main',
    docsDir: 'docs',
    footer: {
      message: 'Apache License V2.0',
      copyright: 'Copyright © 2021-present labring/laf'
    },
    editLink: {
      pattern: 'https://github.com/labring/laf/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    lastUpdated: '更新于',
    nav: NavConfig,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/labring/laf' }
    ],
    sidebar: {
      '/guide/': guideSiderbarConfig,
      '/api/': apiSideBarConfig,
      '/examples/': examplesSideBarConfig
    }
  }
})
