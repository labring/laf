import { defineConfig } from 'vitepress'
import { NavItemsInEnglish, SidebarItemsInEnglish } from './en.mts'
import { NavItemsInZh, SidebarItemsInZh } from './zh.mts'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local'
    }
  },
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
  },

  locales: {  
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: "Laf 开发文档",
      description: "laf 开发文档，像写博客一样写函数。",
      themeConfig: {
        logo: "/logo.png",
        footer: {
          message: "Apache License V2.0",
          copyright: "Copyright © 2021-2024 labring/laf",
        },
        editLink: {
          pattern: "https://github.com/labring/laf/edit/main/docs/:path",
          text: "我修改这一页",
        },
        lastUpdated: {
          text: "更新于"
        },
        docFooter: {
          prev: '上一篇',
          next: '下一篇'
        },
        socialLinks: [
          { icon: "github", link: "https://github.com/labring/laf" },
          { icon: "discord", link: "https://discord.gg/KaxHF86CcF" },
          { icon: "twitter", link: "https://twitter.com/laf_dev" },
        ],
        returnToTopLabel: '返回顶部',
        externalLinkIcon: true,
        outline: 'deep',

        // https://vitepress.dev/reference/default-theme-config
        nav: NavItemsInZh,

        sidebar: SidebarItemsInZh,
      },
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      title: "Laf Documentation",
      description: "Development documentation of laf, write function like writing blog.",
      themeConfig: {
        logo: "/logo.png",
        footer: {
          message: "Apache License V2.0",
          copyright: "Copyright © 2021-2024 labring/laf",
        },
        editLink: {
          pattern: "https://github.com/labring/laf/edit/main/docs/:path",
          text: "Edit this page on GitHub",
        },
        socialLinks: [
          { icon: "github", link: "https://github.com/labring/laf" },
          { icon: "discord", link: "https://discord.gg/KaxHF86CcF" },
          { icon: "twitter", link: "https://twitter.com/laf_dev" },
        ],

        outline: 'deep',

        externalLinkIcon: true,

        // https://vitepress.dev/reference/default-theme-config
        nav: NavItemsInEnglish,

        sidebar: SidebarItemsInEnglish,
      }
    },
  },

})
