import type { FunctionalComponent } from 'preact';
import { useSignal, useComputed } from '@preact/signals';
import { useEffect, useMemo } from 'preact/hooks';
import { recipes } from './recipes';
import { loadAppState, saveAppState, clearAppState } from './storage';
import type { StoredAppState, Ingredient } from './types';
import { copyShoppingList } from './copyShoppingList';
import styles from './styles.module.css';
import IngredientItem from './IngredientItem';

const ShoppingList: FunctionalComponent = () => {
  const initialState = useMemo(() => loadAppState(), []);
  const filterText = useSignal<string>('');
  const selectedRecipes = useSignal<Map<string, number>>(
    initialState.selectedRecipes,
  );

  // Save to localStorage whenever selectedRecipes changes
  useEffect(() => {
    const state: StoredAppState = {
      selectedRecipes: selectedRecipes.value,
    };
    saveAppState(state);
  }, [selectedRecipes.value]);

  // Compute filtered recipes
  const filteredRecipes = useComputed(() => {
    const filter = filterText.value.toLowerCase();
    if (!filter) {
      return Object.keys(recipes);
    }
    return Object.keys(recipes).filter((slug) =>
      recipes[slug].title.toLowerCase().includes(filter),
    );
  });

  // Compute shopping list
  const shoppingList = useComputed(() => {
    const merged = new Map<string, Ingredient>();

    for (const [recipeName, count] of selectedRecipes.value) {
      const recipe = recipes[recipeName];
      if (!recipe) continue;

      for (const ing of recipe.ingredients) {
        const key = `${ing.name}|${ing.unit ?? ''}`;
        const existing = merged.get(key);
        if (existing?.quantity != null && ing.quantity != null) {
          merged.set(key, {
            ...ing,
            quantity: existing.quantity + ing.quantity * count,
          });
        } else if (!existing) {
          merged.set(key, ing.quantity != null ? { ...ing, quantity: ing.quantity * count } : ing);
        }
      }
    }

    return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  const handleFilterChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    filterText.value = target.value;
  };

  const handleAddRecipe = (recipeName: string) => {
    const newSelected = new Map(selectedRecipes.value);
    const currentCount = newSelected.get(recipeName) || 0;
    newSelected.set(recipeName, currentCount + 1);
    selectedRecipes.value = newSelected;
  };

  const handleRemoveRecipe = (recipeName: string) => {
    const newSelected = new Map(selectedRecipes.value);
    const currentCount = newSelected.get(recipeName) || 0;
    if (currentCount > 1) {
      newSelected.set(recipeName, currentCount - 1);
    } else {
      newSelected.delete(recipeName);
    }
    selectedRecipes.value = newSelected;
  };

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to clear all selected recipes and start again?',
      )
    ) {
      clearAppState();
      filterText.value = '';
      selectedRecipes.value = new Map();
    }
  };

  const handleCopyRecipes = async () => {
    const items = Array.from(selectedRecipes.value).map(
      ([recipeSlug, count]) => `${recipes[recipeSlug].title} × ${count}`,
    );
    await navigator.clipboard.writeText(items.join('\n'));
  };

  const handleCopy = () => copyShoppingList(shoppingList.value);

  return (
    <div class={styles.app}>
      <h1>Recipes</h1>

      <div class={styles.filterSection}>
        <input
          type="text"
          class={styles.filterInput}
          placeholder="Filter recipes…"
          value={filterText.value}
          onInput={handleFilterChange}
        />
      </div>

      <h2>Available Recipes</h2>
      <div class={styles.recipeStatus}>
        <span>
          {selectedRecipes.value.size} recipe
          {selectedRecipes.value.size !== 1 ? 's' : ''} selected
        </span>
        <button
          class={`${styles.actionButton} ${styles.resetButton}`}
          onClick={handleReset}
          style={{
            visibility: selectedRecipes.value.size > 0 ? 'visible' : 'hidden',
          }}
        >
          Reset All
        </button>
      </div>
      {filteredRecipes.value.length > 0 ? (
        <div class={styles.recipeList}>
          {filteredRecipes.value.map((recipeSlug) => {
            const count = selectedRecipes.value.get(recipeSlug) || 0;
            const recipe = recipes[recipeSlug];
            return (
              <div key={recipeSlug} class={styles.recipeItem}>
                <a href={`/recipes/${recipeSlug}/`} class={styles.recipeLink}>
                  {recipe.title}
                </a>
                <div class={styles.recipeControls}>
                  {count > 0 && (
                    <>
                      <button
                        class={styles.btnMinus}
                        onClick={() => handleRemoveRecipe(recipeSlug)}
                      >
                        −
                      </button>
                      <span class={styles.recipeCount}>{count}</span>
                    </>
                  )}
                  <button
                    class={styles.btnPlus}
                    onClick={() => handleAddRecipe(recipeSlug)}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div class={styles.emptyState}>No recipes match your filter</div>
      )}

      {selectedRecipes.value.size > 0 && (
        <>
          <h2>Selected Recipes</h2>
          <div class={styles.selectedRecipes}>
            <div class={styles.selectedList}>
              {Array.from(selectedRecipes.value).map(([recipeSlug, count]) => {
                const recipe = recipes[recipeSlug];
                return (
                  <div key={recipeSlug} class={styles.selectedItem}>
                    <a
                      href={`/recipes/${recipeSlug}/`}
                      class={styles.recipeLink}
                    >
                      {recipe.title}
                    </a>
                    <div class={styles.recipeControls}>
                      <button
                        class={styles.btnMinus}
                        onClick={() => handleRemoveRecipe(recipeSlug)}
                      >
                        −
                      </button>
                      <span class={styles.recipeCount}>{count}</span>
                      <button
                        class={styles.btnPlus}
                        onClick={() => handleAddRecipe(recipeSlug)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              class={`${styles.actionButton} ${styles.copyButton}`}
              onClick={handleCopyRecipes}
            >
              Copy recipes
            </button>
          </div>

          <h2>Shopping List</h2>
          <div class={styles.shoppingList}>
            <div class={styles.ingredientList}>
              {shoppingList.value.map((ingredient) => (
                <IngredientItem
                  key={ingredient.name + ingredient.unit}
                  ingredient={ingredient}
                />
              ))}
            </div>
          </div>
          <div class={styles.actionButtons}>
            <button
              class={`${styles.actionButton} ${styles.copyButton}`}
              onClick={handleCopy}
            >
              Copy shopping list
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingList;
