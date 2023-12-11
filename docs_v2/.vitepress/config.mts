import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Laf Development Documentation",
  description: "Development documentation of laf",
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

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],
  }
})
