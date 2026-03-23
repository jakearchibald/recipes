import type { Ingredient } from './types';
import type { FunctionalComponent } from 'preact';
import type Ing from './components/Ing';

declare module '*.mdx' {
  const Component: FunctionalComponent;
  export default Component;
}

declare module '*.mdx?meta' {
  export const title: string | null;
  export const ingredients: Ingredient[];
}
