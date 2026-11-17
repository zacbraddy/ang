import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Pages link to each other as `page.md` (so the context library can check them); serve them as `/page/`.
const mdLinksToRoutes = () => (tree) => {
  const visit = (node) => {
    if (node.type === 'link' && /^[\w-]+\.md(#.*)?$/.test(node.url)) node.url = '/' + node.url.replace('.md', '/');
    node.children?.forEach(visit);
  };
  visit(tree);
};

export default defineConfig({
  markdown: { remarkPlugins: [mdLinksToRoutes] },
  integrations: [
    starlight({
      title: 'Ang',
      description: 'Avoid Navel Gazing. A lean, AI-assisted development workflow for Claude Code.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/zacbraddy/ang' }],
      sidebar: [{ label: 'Home', link: '/' }, 'first-principles', 'commands'],
      components: { Footer: './src/components/Footer.astro' },
    }),
  ],
});
