import type { FunctionalComponent } from 'preact';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import ShoppingList from './ShoppingList';
import RecipeDetail from './RecipeDetail';

type Route =
  | { type: 'home' }
  | { type: 'recipe'; category: string; slug: string };

const App: FunctionalComponent = () => {
  const route = useSignal<Route>({ type: 'home' });

  useEffect(() => {
    const recipePattern = new URLPattern({
      pathname: '/recipes/:category/:slug{/}?',
    });

    const updateRoute = () => {
      const url = navigation!.currentEntry!.url!;

      // Match /recipes/:category/:slug
      const recipeMatch = recipePattern.exec(url);
      if (recipeMatch) {
        const parsed = new URL(url);
        if (!parsed.pathname.endsWith('/')) {
          navigation!.navigate(
            parsed.pathname + '/' + parsed.search + parsed.hash,
            { history: 'replace' },
          );
          return;
        }
        route.value = {
          type: 'recipe',
          category: recipeMatch.pathname.groups.category as string,
          slug: recipeMatch.pathname.groups.slug as string,
        };
        return;
      }

      // Default to home
      route.value = { type: 'home' };
    };

    // Initial route
    updateRoute();

    const handleNavigate = (event: NavigateEvent) => {
      if (!event.canIntercept || event.hashChange || event.downloadRequest) {
        return;
      }

      event.intercept({
        handler: async () => {
          updateRoute();
        },
      });
    };

    navigation!.addEventListener('navigate', handleNavigate);

    return () => {
      navigation!.removeEventListener('navigate', handleNavigate);
    };
  }, []);

  // Render based on route
  if (route.value.type === 'recipe') {
    return (
      <RecipeDetail
        categorySlug={route.value.category}
        slug={route.value.slug}
      />
    );
  }

  return <ShoppingList />;
};

export default App;
