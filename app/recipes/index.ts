import type { Ingredient } from '../types';

export interface Recipe {
  title: string;
  ingredients: Ingredient[];
  steps?: () => Promise<{ default: unknown }>;
  categorySlug: string;
}

export interface Category {
  title: string;
  slug: string;
  recipes: string[]; // slugs in order
}

const categoryModules = import.meta.glob<{
  title: string;
}>('./*/index.ts', { eager: true });

const metaModules = import.meta.glob<{
  title: string | null;
  ingredients: Ingredient[];
}>('./*/*.mdx', { eager: true, query: '?meta' });

const stepModules = import.meta.glob<{ default: unknown }>('./*/*.mdx');

function dirFromPath(path: string): string {
  return path.replace(/^\.\//, '').split('/')[0];
}

function slugFromMdxPath(path: string): string {
  return path.replace(/^\.\/[^/]+\//, '').replace('.mdx', '');
}

export const recipes: Record<string, Recipe> = Object.fromEntries(
  Object.entries(metaModules)
    .filter(([, mod]) => mod.title != null)
    .map(([path, mod]) => [
      slugFromMdxPath(path),
      {
        title: mod.title as string,
        ingredients: mod.ingredients,
        steps: stepModules[path],
        categorySlug: dirFromPath(path),
      },
    ]),
);

export const categories: Category[] = Object.entries(categoryModules)
  .sort(([, a], [, b]) => a.title.localeCompare(b.title))
  .map(([path, mod]) => {
    const catSlug = dirFromPath(path);
    return {
      title: mod.title,
      slug: catSlug,
      recipes: Object.keys(recipes)
        .filter((slug) => recipes[slug].categorySlug === catSlug)
        .sort((a, b) => recipes[a].title.localeCompare(recipes[b].title)),
    };
  })
  .filter((cat) => cat.recipes.length > 0);
