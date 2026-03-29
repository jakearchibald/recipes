import type { FunctionalComponent, ComponentType } from 'preact';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { recipes } from './recipes';
import styles from './styles.module.css';
import IngredientItem from './IngredientItem';
import RecipeLayout from './RecipeLayout';
import Ing from './components/Ing';

const mdxComponents = {
  Ing,
  // Shift headings
  h1: 'h3',
  h2: 'h4',
  h3: 'h5',
  h4: 'h6',
  h5: 'p',
  h6: 'p',
} as const;

declare global {
  type MDXProvidedComponents = typeof mdxComponents;
}

interface RecipeDetailProps {
  slug: string;
}

const RecipeDetail: FunctionalComponent<RecipeDetailProps> = ({ slug }) => {
  const StepsComponent = useSignal<ComponentType<{ components?: Record<string, ComponentType<any>> }> | null>(null);
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
        StepsComponent.value = module.default as ComponentType;
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
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
        wakeLockEnabled.value = false;
      } else {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockEnabled.value = true;

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
      <RecipeLayout>
        <div class={styles.errorMessage}>Recipe not found</div>
      </RecipeLayout>
    );
  }

  return (
    <RecipeLayout>
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
        {recipe.ingredients.map((ingredient) => (
          <IngredientItem key={ingredient.name + ingredient.unit} ingredient={ingredient} />
        ))}
      </div>

      <h2>Steps</h2>

      {loading.value && <div class={styles.loading}>Loading recipe...</div>}

      {error.value && <div class={styles.errorMessage}>{error.value}</div>}

      {!loading.value && !error.value && StepsComponent.value && (
        <>
          <div class={styles.recipeContent}>
            <StepsComponent.value components={mdxComponents} />
          </div>
          <p class={styles.editLink}>
            <a
              href={`https://github.com/jakearchibald/recipes/edit/main/app/recipes/steps/${slug}.mdx`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Edit on GitHub
            </a>
          </p>
        </>
      )}
    </RecipeLayout>
  );
};

export default RecipeDetail;
