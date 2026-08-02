import type { Ingredient } from './types';

/**
 * Combine repeated ingredients into one entry each, summing quantities.
 *
 * Recipes tag the same ingredient at each point it's used (see CLAUDE.md), so a
 * single recipe can list e.g. garlic twice. Entries merge on name + unit, so
 * `Carrot` in grams stays separate from unitless `Carrot`.
 *
 * An entry with no quantity can't be summed, so the first one wins and later
 * quantities for that name/unit are ignored.
 */
export function mergeIngredients(ingredients: Iterable<Ingredient>): Ingredient[] {
  const merged = new Map<string, Ingredient>();

  for (const ingredient of ingredients) {
    const key = `${ingredient.name}|${ingredient.unit ?? ''}`;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, ingredient);
    } else if (existing.quantity != null && ingredient.quantity != null) {
      merged.set(key, {
        ...existing,
        quantity: existing.quantity + ingredient.quantity,
      });
    }
  }

  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Every ingredient in `recipeIngredients`, repeated `count` times over. */
export function* scaleIngredients(
  recipeIngredients: Iterable<Ingredient>,
  count: number,
): Generator<Ingredient> {
  for (const ingredient of recipeIngredients) {
    yield ingredient.quantity != null
      ? { ...ingredient, quantity: ingredient.quantity * count }
      : ingredient;
  }
}
