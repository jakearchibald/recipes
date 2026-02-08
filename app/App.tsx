import type { FunctionalComponent } from 'preact';
import { useSignal, useComputed } from '@preact/signals';
import { useEffect, useMemo } from 'preact/hooks';
import { recipes } from './recipes';
import { loadAppState, saveAppState, clearAppState } from './storage';
import type { StoredAppState } from './types';
import styles from './styles.module.css';

const App: FunctionalComponent = () => {
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
    const ingredients: Record<string, number | boolean> = {};

    for (const [recipeName, count] of selectedRecipes.value) {
      const recipe = recipes[recipeName];
      if (!recipe) continue;

      Object.entries(recipe.ingredients).forEach(([ingredient, value]) => {
        if (typeof value === 'number') {
          const currentValue = ingredients[ingredient];
          if (typeof currentValue === 'number') {
            ingredients[ingredient] = currentValue + value * count;
          } else {
            ingredients[ingredient] = value * count;
          }
        } else if (typeof value === 'boolean' && value) {
          ingredients[ingredient] = true;
        }
      });
    }

    return Object.entries(ingredients).sort(([a], [b]) => a.localeCompare(b));
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

  const handleCopy = async () => {
    const items = shoppingList.value.map(([ingredient, amount]) => {
      if (typeof amount === 'number') {
        return `${ingredient} × ${amount}`;
      }
      return ingredient;
    });
    await navigator.clipboard.writeText(items.join('\n'));
  };

  return (
    <div class={styles.app}>
      <h1>Recipe Shopping List</h1>

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
                <span class={styles.recipeName}>{recipe.title}</span>
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
                    <span class={styles.recipeName}>{recipe.title}</span>
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
              {shoppingList.value.map(([ingredient, amount]) => (
                <div key={ingredient} class={styles.ingredientItem}>
                  <span class={styles.ingredientName}>{ingredient}</span>
                  {typeof amount === 'number' && (
                    <span class={styles.ingredientAmount}>× {amount}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div class={styles.actionButtons}>
            <button class={`${styles.actionButton} ${styles.copyButton}`} onClick={handleCopy}>
              Copy shopping list
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
