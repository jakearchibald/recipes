import type { FunctionalComponent } from 'preact';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { recipes } from './recipes';
import styles from './styles.module.css';
import IngredientItem from './IngredientItem';

interface RecipeDetailProps {
  slug: string;
}

const RecipeDetail: FunctionalComponent<RecipeDetailProps> = ({ slug }) => {
  const recipeHtml = useSignal<string>('');
  const loading = useSignal<boolean>(true);
  const error = useSignal<string | null>(null);

  const recipe = recipes[slug];

  useEffect(() => {
    if (!recipe || !recipe.steps) {
      error.value = 'Recipe not found or has no steps';
      loading.value = false;
      return;
    }

    recipe
      .steps()
      .then((module) => {
        recipeHtml.value = module.default;
        loading.value = false;
      })
      .catch((err) => {
        error.value = 'Failed to load recipe steps';
        console.error('Failed to load recipe:', err);
        loading.value = false;
      });
  }, [slug]);

  if (!recipe) {
    return (
      <div class={styles.app}>
        <div class={styles.recipeDetailHeader}>
          <a href="/" class={styles.backLink}>
            ← Back to Shopping List
          </a>
        </div>
        <div class={styles.errorMessage}>Recipe not found</div>
      </div>
    );
  }

  return (
    <div class={styles.app}>
      <div class={styles.recipeDetailHeader}>
        <a href="/" class={styles.backLink}>
          ← Back to Shopping List
        </a>
      </div>

      <h1>{recipe.title}</h1>

      <h2>Ingredients</h2>
      <div class={styles.ingredientList}>
        {Object.entries(recipe.ingredients).map(([ingredient, amount]) => (
          <IngredientItem
            key={ingredient}
            ingredient={ingredient}
            amount={amount}
          />
        ))}
      </div>

      <h2>Steps</h2>

      {loading.value && <div class={styles.loading}>Loading recipe...</div>}

      {error.value && <div class={styles.errorMessage}>{error.value}</div>}

      {!loading.value && !error.value && (
        <div
          class={styles.recipeContent}
          dangerouslySetInnerHTML={{ __html: recipeHtml.value }}
        />
      )}
    </div>
  );
};

export default RecipeDetail;
