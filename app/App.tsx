import type { FunctionalComponent } from 'preact';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import ShoppingList from './ShoppingList';
import RecipeDetail from './RecipeDetail';

type Route = { type: 'home' } | { type: 'recipe'; slug: string };

const App: FunctionalComponent = () => {
  const route = useSignal<Route>({ type: 'home' });

  useEffect(() => {
    const recipePattern = new URLPattern({ pathname: '/recipes/:slug' });

    const updateRoute = () => {
      const url = navigation!.currentEntry!.url!;

      // Match /recipes/:slug
      const recipeMatch = recipePattern.exec(url);
      if (recipeMatch) {
        route.value = {
          type: 'recipe',
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
    return <RecipeDetail slug={route.value.slug} />;
  }

  return <ShoppingList />;
};

export default App;
