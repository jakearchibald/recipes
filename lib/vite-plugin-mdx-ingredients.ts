import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { visit } from 'unist-util-visit';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { mdxjs } from 'micromark-extension-mdxjs';
import { frontmatter } from 'micromark-extension-frontmatter';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import type { Root } from 'mdast';
import type { MdxJsxFlowElement, MdxJsxTextElement, MdxJsxAttribute } from 'mdast-util-mdx-jsx';

type IngNode = MdxJsxFlowElement | MdxJsxTextElement;

function parseMdx(src: string): Root {
  return fromMarkdown(src, {
    extensions: [mdxjs(), frontmatter()],
    mdastExtensions: [mdxFromMarkdown(), frontmatterFromMarkdown()],
  }) as unknown as Root;
}

function extractIngredients(tree: Root) {
  const results: { name: string; quantity: number | null; unit: string | null }[] = [];

  visit(tree, (node) => {
    const n = node as IngNode;
    if (
      (n.type === 'mdxJsxFlowElement' || n.type === 'mdxJsxTextElement') &&
      n.name === 'Ing'
    ) {
      const attrs: Record<string, string | number | null> = {};
      for (const attr of n.attributes as MdxJsxAttribute[]) {
        if (attr.type !== 'mdxJsxAttribute') continue;
        const val = attr.value;
        if (val == null) {
          attrs[attr.name] = null;
        } else if (typeof val === 'string') {
          attrs[attr.name] = val;
        } else if (val.type === 'mdxJsxAttributeValueExpression') {
          attrs[attr.name] = Number(val.value);
        }
      }
      if (attrs.name) {
        results.push({
          name: attrs.name as string,
          quantity: attrs.quantity != null ? Number(attrs.quantity) : null,
          unit: (attrs.unit as string) ?? null,
        });
      }
    }
  });

  return results;
}

const META_SUFFIX = '?meta';
const META_PREFIX = '\0mdx-meta:';

export function mdxIngredients(): Plugin {
  return {
    name: 'vite-plugin-mdx-ingredients',
    enforce: 'pre',
    async resolveId(id, importer) {
      if (!id.endsWith(META_SUFFIX)) return null;
      const base = id.slice(0, -META_SUFFIX.length);
      const resolved = await this.resolve(base, importer);
      if (!resolved) return null;
      return META_PREFIX + resolved.id;
    },
    load(id) {
      if (!id.startsWith(META_PREFIX)) return null;
      const filePath = id.slice(META_PREFIX.length);
      this.addWatchFile(filePath);
      const src = readFileSync(filePath, 'utf-8');
      const tree = parseMdx(src);
      const ingredients = extractIngredients(tree);
      let title: string | null = null;
      visit(tree, 'yaml', (node: { value: string }) => {
        const match = /^title:\s*(.+)$/m.exec(node.value);
        title = match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
      });
      return [
        `export const title = ${JSON.stringify(title)};`,
        `export const ingredients = ${JSON.stringify(ingredients)};`,
      ].join('\n');
    },
  };
}
