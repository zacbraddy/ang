import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkDefinitionList, defListHastHandlers } from 'remark-definition-list';

const base = '/ang';

// Pages link to each other as `page.md` (so the context library can check them); serve them as `/page/`.
const mdLinksToRoutes = () => (tree) => {
  const visit = (node) => {
    if (node.type === 'link' && /^[\w-]+\.mdx?(#.*)?$/.test(node.url)) node.url = `${base}/` + node.url.replace(/\.mdx?/, '/');
    node.children?.forEach(visit);
  };
  visit(tree);
};

export default defineConfig({
  site: 'https://zacbraddy.github.io',
  base,
  markdown: { remarkPlugins: [mdLinksToRoutes, remarkDefinitionList], remarkRehype: { handlers: defListHastHandlers } },
  integrations: [
    starlight({
      title: 'Ang',
      description: 'Avoid Navel Gazing. A lean, AI-assisted development workflow for Claude Code.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/zacbraddy/ang' }],
      sidebar: [{ label: 'Home', link: '/' }, 'first-principles', 'commands'],
      customCss: ['./src/styles/theme.css'],
      components: { Footer: './src/components/Footer.astro' },
    }),
  ],
});
