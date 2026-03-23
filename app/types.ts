export const INGREDIENTS = [
  // Vegetables
  { name: 'Onion', unit: null },
  { name: 'Spring onion', unit: null },
  { name: 'Carrot', unit: 'g' },
  { name: 'Red pepper', unit: null },
  { name: 'Parsnip', unit: 'g' },
  { name: 'Courgette', unit: null },
  { name: 'Celery', unit: 'stalk' },
  { name: 'Tomato', unit: null },
  { name: 'Grape tomatoes', unit: 'g' },
  { name: 'Chopped tomatoes', unit: 'g' },

  // Meat & Protein
  { name: 'Chicken', unit: 'g' },
  { name: 'Chicken', unit: 'breast' },
  { name: 'Steak mince', unit: 'g' },
  { name: 'Cumberland sausage meat', unit: 'g' },
  { name: 'Bacon', unit: 'pack' },

  // Cheese & Dairy
  { name: 'Cheese', unit: 'g' },
  { name: 'Halloumi', unit: 'block' },
  { name: 'Philadelphia', unit: 'g' },
  { name: 'Sour cream', unit: 'ml' },
  { name: 'Single cream', unit: 'ml' },
  { name: 'Double cream', unit: 'ml' },
  { name: 'Milk', unit: 'ml' },
  { name: 'Coconut milk', unit: 'ml' },
  { name: 'Mozzarella', unit: 'ball' },
  { name: 'Grated parmesan', unit: null },
  { name: 'Butter', unit: null },

  // Processed meats
  { name: 'Chorizo ring', unit: null },
  { name: 'Nduja paste', unit: 'g' },

  // Vegetables & Aromatics
  { name: 'Mushroom', unit: 'g' },
  { name: 'Garlic', unit: 'clove' },
  { name: 'Chillies', unit: null },

  // Herbs & Spices
  { name: 'Dry thyme', unit: null },
  { name: 'Fresh tarragon', unit: 'pack' },
  { name: 'Mixed herbs', unit: 'tsp' },
  { name: 'Thai basil', unit: 'pack' },
  { name: 'Fresh basil', unit: 'pack' },
  { name: 'Rocket', unit: 'pack' },
  { name: 'Coriander', unit: 'sprig' },
  { name: 'Roasting herbs', unit: 'pack' },
  { name: 'Curry powder', unit: null },
  { name: 'Cumin seeds', unit: 'tsp' },
  { name: 'Cajun spice', unit: 'tbsp' },
  { name: 'Cajun seasoning', unit: null },
  { name: 'Chilli powder', unit: 'tsp' },
  { name: 'Mustard powder', unit: 'tsp' },
  { name: 'Pepper', unit: null },
  { name: 'MSG', unit: 'tsp' },

  // Stock
  { name: 'Vegetable stock', unit: 'pot' },
  { name: 'Chicken stock', unit: 'pot' },
  { name: 'Beef stock', unit: 'pot' },

  // Asian ingredients
  { name: 'Galangal paste', unit: 'g' },
  { name: 'Lemongrass', unit: 'stalk' },
  { name: 'Kaffir lime leaves', unit: null },
  { name: 'Fish sauce', unit: 'tbsp' },
  { name: 'Fish sauce', unit: 'ml' },
  { name: 'Oyster sauce', unit: 'tsp' },
  { name: 'Soy sauce', unit: 'tsp' },
  { name: 'Thai red curry paste', unit: 'g' },
  { name: 'Red curry paste', unit: 'g' },

  // Pasta & Noodles
  { name: 'Dry egg noodles', unit: 'g' },
  { name: 'Pasta', unit: 'g' },
  { name: 'Tortellini', unit: 'pack' },

  // Rice & Grains
  { name: 'Jasmine rice', unit: 'serving' },
  { name: 'Split red lentils', unit: 'g' },
  { name: 'Kidney beans', unit: 'g' },

  // Sauces & Condiments
  { name: 'Pesto', unit: 'g' },
  { name: 'Sriracha', unit: 'tbsp' },
  { name: 'Tomato puree', unit: 'tbsp' },
  { name: 'Bovril', unit: null },

  // Sweeteners
  { name: 'Honey', unit: 'tbsp' },
  { name: 'Honey', unit: null },
  { name: 'Sugar', unit: 'tsp' },
  { name: 'Light brown sugar', unit: 'tbsp' },
  { name: 'Granulated sugar', unit: 'ml' },

  // Citrus
  { name: 'Lime juice' },

  // Other
  { name: 'Eggs', unit: null },
  { name: 'Chinese curry blocks', unit: 'serving' },

  // Spirits & Liqueurs
  { name: 'Amaretto', unit: 'ml' },
  { name: 'Bourbon', unit: 'ml' },
  { name: 'Whiskey', unit: 'ml' },
  { name: 'Aperol', unit: 'ml' },

  // Wine & Champagne
  { name: 'Prosecco', unit: 'ml' },

  // Mixers & Garnishes
  { name: 'Lemonade', unit: 'ml' },
  { name: 'Lemon juice', unit: 'ml' },
  { name: 'Simple syrup', unit: 'tsp' },
  { name: 'Egg white', unit: 'ml' },
  { name: 'Bitters', unit: null },

  { name: 'Water', unit: 'tbsp' },
] as const;

const unitText: Partial<
  Record<Exclude<IngredientUnit, null>, { singular: string; plural?: string }>
> = {
  pot: { singular: ' pot', plural: ' pots' },
  clove: { singular: ' clove', plural: ' cloves' },
  pack: { singular: ' pack', plural: ' packs' },
  ball: { singular: ' ball', plural: ' balls' },
  breast: { singular: ' breast', plural: ' breasts' },
  stalk: { singular: ' stalk', plural: ' stalks' },
  serving: { singular: ' serving', plural: ' servings' },
  block: { singular: ' block', plural: ' blocks' },
};

export function getUnitText(
  unit: IngredientUnit,
  quantity: number | null,
): string {
  if (unit == null) return '';
  const unitInfo = unitText[unit];
  if (!unitInfo) {
    return unit || '';
  }
  if (quantity === 1) return unitInfo.singular;
  return unitInfo.plural ?? unitInfo.singular;
}

export type IngredientDef = (typeof INGREDIENTS)[number];

export type IngredientName = IngredientDef['name'];
export type IngredientUnit = IngredientDef['unit'];

export type Ingredient = IngredientDef & { quantity: number | null };

export interface StoredAppState {
  selectedRecipes: Map<string, number>;
}

export const createInitialStoredState = (): StoredAppState => ({
  selectedRecipes: new Map(),
});
