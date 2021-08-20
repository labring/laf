module.exports = {
  lang: 'zh-CN',
  title: 'LaF 云开发文档',
  description: '开发者的使用文档',

  themeConfig: {
    repo: 'Maslow/less-framework',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页',
    lastUpdated: '上次编辑',

    nav: [
      { text: '主页', link: '/' },
      { text: '快速部署', link: '/deploy' },
      { text: '开发指南', link: '/guide/', activeMatch: '^/guide/' },
      { text: '运行截图', link: '/screenshots', },
      {
        text: '关于',
        link: '/about'
      },
      {
        text: 'Changelogs',
        link: 'https://github.com/Maslow/less-framework/blob/main/CHANGELOG.md'
      }
    ],

    sidebar: {
      '/guide/': getGuideSidebar(),
      '/about': getGuideSidebar(),
    }
  }
}

function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        { text: 'What is VitePress?', link: '/' },
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Configuration', link: '/guide/configuration' },
        { text: 'Asset Handling', link: '/guide/assets' },
        { text: 'Markdown Extensions', link: '/guide/markdown' },
        { text: 'Using Vue in Markdown', link: '/guide/using-vue' },
        { text: 'Deploying', link: '/guide/deploy' }
      ]
    },
    {
      text: 'Advanced',
      children: [
        { text: 'Frontmatter', link: '/guide/frontmatter' },
        { text: 'Theming', link: '/guide/theming' },
        { text: 'API Reference', link: '/guide/api' },
        {
          text: 'Differences from Vuepress',
          link: '/guide/differences-from-vuepress'
        }
      ]
    }
  ]
}

function getConfigSidebar() {
  return [
    {
      text: 'App Config',
      children: [{ text: 'Basics', link: '/config/basics' }]
    },
    {
      text: 'Theme Config',
      children: [
        { text: 'Homepage', link: '/config/homepage' },
        { text: 'Algolia Search', link: '/config/algolia-search' },
        { text: 'Carbon Ads', link: '/config/carbon-ads' }
      ]
    }
  ]
}