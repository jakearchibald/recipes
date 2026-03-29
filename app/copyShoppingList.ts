import type { Ingredient } from './types';
import { getUnitText } from './types';

export async function copyShoppingList(ingredients: Ingredient[]): Promise<void> {
  const items = ingredients.map((ing) => {
    if (ing.quantity != null && getUnitText(ing.unit, ing.quantity)) {
      return `${ing.name} × ${ing.quantity}${getUnitText(ing.unit, ing.quantity)}`;
    } else if (ing.quantity != null) {
      return `${ing.name} × ${ing.quantity}`;
    }
    return ing.name;
  });
  await navigator.clipboard.writeText(items.join('\n'));
}
