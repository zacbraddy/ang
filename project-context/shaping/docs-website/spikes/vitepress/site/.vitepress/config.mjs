import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Ang',
  description: 'Avoid Navel Gazing. A lean, AI-assisted development workflow for Claude Code.',
  themeConfig: {
    nav: [{ text: 'Home', link: '/' }],
    sidebar: [
      { text: 'Home', link: '/' },
      { text: 'First principles', link: '/first-principles' },
      { text: 'Commands', link: '/commands' },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/zacbraddy/ang' }],
    search: { provider: 'local' },
    footer: { message: 'Built by <a href="https://zackerthehacker.com">Zac Braddy</a> as part of his work at We Right Code.' },
  },
});
