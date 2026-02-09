import type { FunctionalComponent } from 'preact';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
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
  const wakeLockEnabled = useSignal<boolean>(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

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

  useEffect(() => {
    // Release wake lock when component unmounts
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  const toggleWakeLock = async () => {
    try {
      if (wakeLockEnabled.value) {
        // Release the wake lock
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
        wakeLockEnabled.value = false;
      } else {
        // Request a wake lock
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockEnabled.value = true;

        // Handle wake lock release (e.g., when tab becomes inactive)
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockEnabled.value = false;
          wakeLockRef.current = null;
        });
      }
    } catch (err) {
      console.error('Wake Lock error:', err);
      alert(
        `Failed to ${wakeLockEnabled.value ? 'release' : 'acquire'} wake lock`,
      );
    }
  };

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

      <div class={styles.wakeLockControl}>
        <label>
          <input
            type="checkbox"
            checked={wakeLockEnabled.value}
            onChange={toggleWakeLock}
          />
          Keep screen awake
        </label>
      </div>

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
        <>
          <div
            class={styles.recipeContent}
            dangerouslySetInnerHTML={{ __html: recipeHtml.value }}
          />
          <p class={styles.editLink}>
            <a
              href={`https://github.com/jakearchibald/recipes/edit/main/app/recipes/steps/${slug}.md`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Edit on GitHub
            </a>
          </p>
        </>
      )}
    </div>
  );
};

export default RecipeDetail;
