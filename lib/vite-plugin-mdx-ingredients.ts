import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { visit } from 'unist-util-visit';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { mdxjs } from 'micromark-extension-mdxjs';
import { frontmatter } from 'micromark-extension-frontmatter';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import type { Root } from 'mdast';
import type { MdxJsxFlowElement, MdxJsxTextElement, MdxJsxAttribute } from 'mdast-util-mdx-jsx';
import { INGREDIENTS } from '../app/types.ts';

type IngNode = MdxJsxFlowElement | MdxJsxTextElement;

function parseMdx(src: string): Root {
  return fromMarkdown(src, {
    extensions: [mdxjs(), frontmatter()],
    mdastExtensions: [mdxFromMarkdown(), frontmatterFromMarkdown()],
  }) as unknown as Root;
}

function extractIngredients(tree: Root) {
  const results: {
    name: string;
    quantity: number | null;
    unit: string | null;
    line: number;
  }[] = [];

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
          line: n.position?.start.line ?? 0,
        });
      }
    }
  });

  return results;
}

/**
 * `<Ing>` usage in .mdx is invisible to `tsc` (the `declare module '*.mdx'`
 * wildcard means the files are never parsed), so validate the name/unit pairs
 * against INGREDIENTS here instead.
 */
export function validateIngredients(
  filePath: string,
  ingredients: ReturnType<typeof extractIngredients>,
): string[] {
  const errors: string[] = [];

  for (const ing of ingredients) {
    const byName = INGREDIENTS.filter((def) => def.name === ing.name);

    if (byName.length === 0) {
      errors.push(
        `${filePath}:${ing.line}: Unknown ingredient "${ing.name}". Add it to INGREDIENTS in app/types.ts.`,
      );
      continue;
    }

    if (!byName.some((def) => def.unit === ing.unit)) {
      const valid = byName
        .map((def) => (def.unit === null ? 'no unit' : `"${def.unit}"`))
        .join(', ');
      errors.push(
        `${filePath}:${ing.line}: Invalid unit ${
          ing.unit === null ? 'none' : `"${ing.unit}"`
        } for "${ing.name}". Valid: ${valid}.`,
      );
    }
  }

  return errors;
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
      const parsed = extractIngredients(tree);

      const errors = validateIngredients(relative(process.cwd(), filePath), parsed);
      if (errors.length > 0) this.error(errors.join('\n'));

      const ingredients = parsed.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
      }));
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
