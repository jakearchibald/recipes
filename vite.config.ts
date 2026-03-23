import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import preact from '@preact/preset-vite';
import { markdown } from './lib/vite-plugin-markdown';
import mdx from '@mdx-js/rollup';
import { mdxIngredients } from './lib/vite-plugin-mdx-ingredients';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

export default defineConfig({
  base: '/',
  plugins: [
    mdxIngredients(),
    mdx({
      jsxImportSource: 'preact',
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
    preact(),
    markdown(),
    cloudflare({
      experimental: { headersAndRedirectsDevModeSupport: true },
    }),
  ],
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: {
            index: 'index.html',
          },
        },
      },
    },
  },
});
