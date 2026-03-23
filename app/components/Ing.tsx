import type { FunctionalComponent } from 'preact';
import { getUnitText, type IngredientDef } from '../types';
import styles from '../styles.module.css';

type NullUnitDef = Extract<IngredientDef, { unit: null }>;
type StringUnitDef = Exclude<IngredientDef, { unit: null }>;
type IngProps = { quantity?: number } & (
  | (Omit<NullUnitDef, 'unit'> & { unit?: null })
  | StringUnitDef
);

const Ing: FunctionalComponent<IngProps> = ({ name, quantity, unit }) => {
  const unitLabel = unit ? getUnitText(unit, quantity ?? null) : '';

  const label =
    quantity != null && unit
      ? `${name} (${quantity}${unitLabel})`
      : quantity != null
        ? `${name} (${quantity})`
        : name;
  return <span class={styles.ingredient}>{label}</span>;
};

export default Ing;
