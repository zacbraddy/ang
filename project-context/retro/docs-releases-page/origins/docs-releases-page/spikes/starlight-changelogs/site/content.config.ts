import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { changelogsLoader } from 'starlight-changelogs/loader';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  changelogs: defineCollection({
    loader: changelogsLoader([
      {
        provider: 'github',
        base: 'releases',
        title: 'Releases',
        owner: 'zacbraddy',
        repo: 'ang',
        pageSize: 100,
        token: process.env.GITHUB_TOKEN,
      },
    ]),
  }),
};
