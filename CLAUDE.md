# Recipes

A Preact + Vite app. Recipes are `.mdx` files in [app/recipes/](app/recipes/), one
per file, grouped into a directory per category.

## Writing recipes

Write ingredients inline, at the point in the step where they're used. Don't put a
separate ingredients list at the top — the shopping list is generated from the
`<Ing>` tags, so a list would double-count.

```mdx
1. Dice <Ing name="Onion" quantity={1} /> and fry for 3 minutes.
```

### Repeat `<Ing>` for separate instances of the same ingredient

If an ingredient is used at two different points, tag it at **both** points with the
quantity used there. Don't tag the total once and refer back to "the remaining N" in
prose.

```mdx
1. Roast <Ing name="Garlic" quantity={35} unit="clove" />.
2. Saute <Ing name="Garlic" quantity={5} unit="clove" />, minced.
```

The shopping list merges by `name|unit`, so those two sum to a single "Garlic (40
cloves)" line — correct total, and each step reads correctly on its own. Tagging 40
once and writing "the remaining 5 cloves" gets the same total but makes the steps
harder to follow. See [seriously-garlic-chicken-soup.mdx](app/recipes/soups/seriously-garlic-chicken-soup.mdx).

Note the merge only sums when both instances share a unit. `Carrot` with `unit="g"`
and `Carrot` with no unit are separate lines, by design.

### Ingredient names are a fixed list

Every `name`/`unit` pair must exist in `INGREDIENTS` in [app/types.ts](app/types.ts).
New ingredients go there first. An unknown name, or a valid name with the wrong unit,
fails the build:

```
app/recipes/soups/creamy-mushroom-soup.mdx:6: Unknown ingredient "Mushrom".
```

This check lives in [lib/vite-plugin-mdx-ingredients.ts](lib/vite-plugin-mdx-ingredients.ts).
It exists because `tsc` cannot see inside `.mdx` files — the wildcard
`declare module '*.mdx'` in [app/mdx.d.ts](app/mdx.d.ts) types them as a bare
component, so `<Ing>` props are never checked by the compiler. The `checkMdx` setting
in [tsconfig.app.json](tsconfig.app.json) only drives editor tooling, not the build.

## Commands

- `npm run dev` — dev server
- `npm run typecheck` — `tsc -b` across all project references
- `npm run build` — typecheck, then Vite build
- `npm run deploy` — build, then `wrangler deploy`
