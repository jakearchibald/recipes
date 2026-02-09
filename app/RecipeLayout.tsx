import type { ComponentChildren, FunctionalComponent } from 'preact';
import styles from './styles.module.css';

interface RecipeLayoutProps {
  children: ComponentChildren;
}

const RecipeLayout: FunctionalComponent<RecipeLayoutProps> = ({ children }) => {
  return (
    <div class={styles.app}>
      <div class={styles.recipeDetailHeader}>
        <a href="/" class={styles.backLink}>
          ← Back to Shopping List
        </a>
      </div>
      {children}
    </div>
  );
};

export default RecipeLayout;
