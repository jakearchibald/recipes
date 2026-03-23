import type { Ingredient } from '../types';

export interface Recipe {
  title: string;
  ingredients: Ingredient[];
  steps?: () => Promise<{ default: unknown }>;
}

function pathToSlug(path: string): string {
  return path.replace('./steps/', '').replace('.mdx', '');
}

const metaModules = import.meta.glob<{
  title: string | null;
  ingredients: Ingredient[];
}>('./steps/*.mdx', { eager: true, query: '?meta' });

const stepModules = import.meta.glob<{ default: unknown }>('./steps/*.mdx');

export const recipes: Record<string, Recipe> = Object.fromEntries(
  Object.entries(metaModules)
    .filter(([, mod]) => mod.title != null)
    .map(([path, mod]) => {
      const slug = pathToSlug(path);
      const contentPath = path;
      return [
        slug,
        {
          title: mod.title as string,
          ingredients: mod.ingredients,
          steps: stepModules[contentPath],
        },
      ];
    }),
);
