import { AppProvider, useAppContext } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { NavigationBar } from './components/layout/NavigationBar';
import { RestaurantListPage } from './components/restaurant/RestaurantListPage';
import { RoulettePage } from './components/roulette/RoulettePage';
import { ReviewForm } from './components/form/ReviewForm';
import type { RestaurantFormData } from './types';

function AppContent() {
  const { state, dispatch } = useAppContext();

  const handleFormSubmit = (data: RestaurantFormData) => {
    if (state.ui.editingRestaurantId) {
      dispatch({
        type: 'UPDATE_RESTAURANT',
        payload: { id: state.ui.editingRestaurantId, data },
      });
    } else {
      dispatch({ type: 'ADD_RESTAURANT', payload: data });
    }
    dispatch({ type: 'SET_UI', payload: { isFormOpen: false, editingRestaurantId: null } });
  };

  const handleFormCancel = () => {
    dispatch({ type: 'SET_UI', payload: { isFormOpen: false, editingRestaurantId: null } });
  };

  const handleAddNewTag = (name: string): string => {
    dispatch({ type: 'ADD_TAG', payload: { name } });
    // Find the newly added tag by name (case-insensitive match)
    const trimmed = name.trim();
    const existing = state.tags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing.id;
    // If not found yet (state hasn't re-rendered), generate a placeholder id
    // In practice, the reducer uses crypto.randomUUID() and the next render will have it
    // We return a temporary lookup — the TagInput will use the tags from state
    return '';
  };

  const editingRestaurant = state.ui.editingRestaurantId
    ? state.restaurants.find((r) => r.id === state.ui.editingRestaurantId)
    : undefined;

  return (
    <Layout>
      {state.currentPage === 'roulette' ? <RoulettePage /> : <RestaurantListPage />}

      <NavigationBar />

      {state.ui.isFormOpen && (
        <ReviewForm
          mode={state.ui.editingRestaurantId ? 'edit' : 'create'}
          initialData={editingRestaurant}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          allTags={state.tags}
          onAddNewTag={handleAddNewTag}
        />
      )}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
