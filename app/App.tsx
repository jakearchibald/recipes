import type { FunctionalComponent } from 'preact';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import ShoppingList from './ShoppingList';
import RecipeDetail from './RecipeDetail';

interface RouteState {
  path: string;
  params: Record<string, string>;
}

const App: FunctionalComponent = () => {
  const route = useSignal<RouteState>({ path: '/', params: {} });

  useEffect(() => {
    const recipePattern = new URLPattern({ pathname: '/recipes/:slug' });

    const updateRoute = () => {
      const url = location.href;

      // Match /recipes/:slug
      const recipeMatch = recipePattern.exec(url);
      if (recipeMatch) {
        route.value = {
          path: '/recipes/:slug',
          params: recipeMatch.pathname.groups as Record<string, string>,
        };
        return;
      }

      // Default to home
      route.value = { path: '/', params: {} };
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

    self.navigation!.addEventListener('navigate', handleNavigate);

    return () => {
      self.navigation!.removeEventListener('navigate', handleNavigate);
    };
  }, []);

  // Render based on route
  if (route.value.path === '/recipes/:slug') {
    return <RecipeDetail slug={route.value.params.slug} />;
  }

  return <ShoppingList />;
};

export default App;
