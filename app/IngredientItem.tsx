import type { FunctionalComponent } from 'preact';
import type { Ingredient } from './types';
import { getUnitText } from './types';
import styles from './styles.module.css';

interface IngredientItemProps {
  ingredient: Ingredient;
}

const IngredientItem: FunctionalComponent<IngredientItemProps> = ({
  ingredient,
}) => {
  const { name, quantity } = ingredient;
  return (
    <div class={styles.ingredientItem}>
      <span class={styles.ingredientName}>{name}</span>
      {quantity != null && (
        <span class={styles.ingredientAmount}>
          × {quantity}
          {getUnitText(ingredient.unit, quantity)}
        </span>
      )}
    </div>
  );
};

export default IngredientItem;
