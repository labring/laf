import { DefaultTheme } from 'vitepress'


function wrapGray(content: string) {
  return `<span style='color:darkgray'>${content}</span>`
}

export const NavItemsInZh: DefaultTheme.NavItem[] = [
  { text: '开发指南', link: '/zh/' },
  { text: '使用实例', link: '/zh/examples/' },
  { text: '旧版文档', link: 'https://doc.laf.run/old/' }
]

export const SidebarItemsInZh: DefaultTheme.SidebarItem[] = [
  {
    text: '入门',
    link: '/zh/',
    items: [
      {
        text: 'laf 介绍',
        link: '/zh/',
      },
      {
        text: '快速开始',
        link: '/zh/quick-start/login'
      }
    ],
  },
  {
    text: '云函数',
    collapsed: false,
    items: [
      { text: '云函数简介', link: '/zh/cloud-function/' },
      { text: '快速开始', link: '/zh/cloud-function/quick-start' },
      {
        text: '处理 HTTP',
        collapsed: true,
        items: [
          { text: '请求', link: '/zh/cloud-function/request' },
          { text: '响应', link: '/zh/cloud-function/response' },
          { text: '认证', link: '/zh/cloud-function/auth' },
          { text: '文件上传', link: '/zh/cloud-function/files' },
        ]
      },
      { text: '发起网络请求', link: '/zh/cloud-function/fetch' },
      { text: '函数引用', link: '/zh/cloud-function/import' },
      { text: '环境变量', link: '/zh/cloud-function/env' },
      { text: '依赖管理', link: '/zh/cloud-function/deps' },
      { text: '定时任务', link: '/zh/cloud-function/cron' },
      {
        text: '内置云函数',
        collapsed: true,
        items: [
          { text: '拦截器', link: '/zh/cloud-function/interceptor' },
          { text: '初始化', link: '/zh/cloud-function/init' },
          { text: 'WebSocket', link: '/zh/cloud-function/websocket' },
        ],
      },
    ]
  },
  {
    text: '云数据库',
    collapsed: false,
    items: [
      { text: '云数据库简介', link: '/zh/cloud-database/' },
      { text: '快速开始', link: '/zh/cloud-database/quick-start' },
      { text: '插入文档', link: '/zh/cloud-database/insert' },
      {
        text: '查询文档',
        link: '/zh/cloud-database/find',
        collapsed: true,
        items: [
          { text: '条件查询', link: '/zh/cloud-database/query/condition' },
          { text: '排序查询', link: '/zh/cloud-database/query/sort' },
          { text: '分页查询', link: '/zh/cloud-database/query/pagination' },
          { text: '嵌套文档查询', link: '/zh/cloud-database/query/nested' },
          { text: '正则模糊查询', link: '/zh/cloud-database/query/regex' },
          { text: '数组查询', link: '/zh/cloud-database/query/array' },
        ]
      },
      { text: '更新文档', link: '/zh/cloud-database/update' },
      { text: '删除文档', link: '/zh/cloud-database/delete' },
      {
        text: '进阶使用',
        collapsed: true,
        items: [
          { text: '聚合查询(TBD)' },
          { text: '事务(TBD)' },
          { text: '组合操作(TBD)' },
          { text: '索引(TBD)' },
          { text: '时序集合(TBD)' },
          { text: '变更流(TBD)' },
        ]
      },
      {
        text: wrapGray('旧版语法'),
        collapsed: true,
        items: [
          { text: wrapGray('数据库简介'), link: '/zh/cloud-database/database-ql/' },
          { text: wrapGray('数据库入门'), link: '/zh/cloud-database/database-ql/quickstart' },
          { text: wrapGray('新增数据'), link: '/zh/cloud-database/database-ql/add' },
          { text: wrapGray('查询数据'), link: '/zh/cloud-database/database-ql/find' },
          { text: wrapGray('更新数据'), link: '/zh/cloud-database/database-ql/update' },
          { text: wrapGray('删除数据'), link: '/zh/cloud-database/database-ql/del' },
          { text: wrapGray('数据库操作符'), link: '/zh/cloud-database/database-ql/command' },
          { text: wrapGray('数据库聚合操作'), link: '/zh/cloud-database/database-ql/aggregate' },
          { text: wrapGray('数据库运算'), link: '/zh/cloud-database/database-ql/operator' },
        ]
      }
    ],
  },
  {
    text: '云存储',
    collapsed: false,
    items: [
      { text: '云存储简介', link: '/zh/cloud-storage/' },
      { text: '上传文件', link: '/zh/cloud-storage/upload' },
      { text: '读取文件', link: '/zh/cloud-storage/read' },
      { text: '删除文件', link: '/zh/cloud-storage/delete' },
      { text: '文件列表', link: '/zh/cloud-storage/list' },
      { text: '生成文件上传地址', link: '/zh/cloud-storage/upload-url' },
      { text: '生成文件下载地址', link: '/zh/cloud-storage/download-url' },
      { text: '网站托管', link: '/zh/cloud-storage/website-hosting' },
      {
        text: '更多例子',
        collapsed: true,
        items: [
          { text: '微信小程序上传文件', link: '/zh/examples/wxmp-upload' },
          { text: 'GitHub Action 持续集成网站托管', link: '/zh/examples/website-hosting-ci-cd.md' },
          { text: 'Web 前端上传文件(TBD)' },
          { text: '微信小程序上传文件(TBD)' },
        ]
      }
    ],
  },
  {
    text: '工具',
    items: [{ text: 'laf-cli', link: '/zh/cli/' }],
  },
  {
    text: '其他',
    items: [
      { text: 'Laf 迁移到 Sealaf', link: '/zh/other/sealaf-migration' },
    ],
  }
]