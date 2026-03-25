export default {
  lang: 'zh-CN',
  title: 'heronlyj',
  description: '研究、笔记与实用指南',
  cleanUrls: false,
  ignoreDeadLinks: true,

  // 启用 VitePress 自带暗色模式（默认跟随系统）
  appearance: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '南山区小学指南', link: '/guide/shenzhen-nanshan-primary-2025.html' }
    ],

    // 社交链接（可选）
    socialLinks: [
      { icon: 'github', link: 'https://github.com/heronlyj' }
    ],

    // 底部
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 heronlyj'
    },

    // 搜索
    search: {
      provider: 'local'
    }
  }
}
