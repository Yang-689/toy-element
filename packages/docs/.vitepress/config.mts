import { defineConfig } from 'vitepress'
import { containerPreview, componentPreview } from '@vitepress-demo-preview/plugin'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Toy-Element',
  description: '高仿 Element 组件库',
  base: '/toy-element/',
  appearance: false, // 明暗主题切换
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '开始使用', link: '/get-started' },
      { text: '组件', link: '/components/button' },
    ],
    search: {
      provider: 'local',
    },
    sidebar: [
      {
        text: '指南',
        // collapsed: false,
        items: [{ text: '快速开始', link: '/get-started' }],
      },
      {
        text: '基础组件',
        // collapsed: false,
        items: [
          { text: 'Button 按钮', link: '/components/button' },
          // { text: 'Collapse 折叠面板', link: 'components/collapse' },
          // { text: 'Dropdown 下拉菜单', link: 'components/dropdown' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/Yang-689/toy-element' }],
  },
  markdown: {
    config(md) {
      /**
       * SSR 兼容性
       * @link https://vitepress.dev/guide/ssr-compat
       * 如果组件不支持 SSR，可以指定 clientOnly 以禁用 SSR。
       */
      md.use(containerPreview, { clientOnly: true })
      md.use(componentPreview, { clientOnly: true })
    },
  },
})
