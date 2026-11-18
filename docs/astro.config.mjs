import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightLlmsTxt from 'starlight-llms-txt';

const group = (label, directory) => ({ label, items: [{ autogenerate: { directory } }] });

export default defineConfig({
  site: 'https://zacbraddy.github.io',
  base: '/ang',
  integrations: [
    mermaid(),
    starlight({
      title: 'Ang',
      description: 'Avoid Navel Gazing. A lean, opinionated framework for AI-assisted development.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/zacbraddy/ang' }],
      plugins: [starlightLlmsTxt()],
      sidebar: [
        { label: 'Home', link: '/' },
        group('Start here', 'start-here'),
        group('Concepts', 'concepts'),
        group('Commands', 'commands'),
        group('Reference', 'reference'),
        group('Why Ang', 'why-ang'),
      ],
      customCss: ['./src/styles/theme.css'],
      components: { Footer: './src/components/Footer.astro' },
    }),
  ],
});
