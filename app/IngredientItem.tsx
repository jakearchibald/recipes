import type { FunctionalComponent } from 'preact';
import styles from './styles.module.css';

interface IngredientItemProps {
  ingredient: string;
  amount: number | boolean;
}

const IngredientItem: FunctionalComponent<IngredientItemProps> = ({
  ingredient,
  amount,
}) => {
  return (
    <div class={styles.ingredientItem}>
      <span class={styles.ingredientName}>{ingredient}</span>
      {typeof amount === 'number' && (
        <span class={styles.ingredientAmount}>× {amount}</span>
      )}
    </div>
  );
};

export default IngredientItem;
