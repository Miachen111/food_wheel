import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { AppState, AppAction } from '../types';
import { DEFAULT_FILTER } from '../types';
import { appReducer } from './appReducer';
import { loadData, saveData, deleteRestaurant } from '../services/dataService';

// === Initial State ===

const initialState: AppState = {
  restaurants: [],
  tags: [],
  filters: DEFAULT_FILTER,
  selectedRestaurantIds: [],
  currentPage: 'list',
  ui: {
    isFormOpen: false,
    editingRestaurantId: null,
    expandedCardId: null,
    isSpinning: false,
    resultRestaurantId: null,
    scrollPosition: 0,
  },
};

// === Context ===

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

// === Provider ===

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const isFirstRender = useRef(true);
  const prevRestaurantsRef = useRef<string>('');
  const prevTagsRef = useRef<string>('');

  // On mount: load data from Supabase
  useEffect(() => {
    async function init() {
      try {
        const data = await loadData();
        if (data) {
          dispatch({ type: 'LOAD_DATA', payload: data });
        }
      } catch (error) {
        console.error('[AppContext] Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Enhanced dispatch that handles DB-side deletions
  const enhancedDispatch = useCallback((action: AppAction) => {
    if (action.type === 'DELETE_RESTAURANT') {
      deleteRestaurant(action.payload.id).catch((error) => {
        console.error('[AppContext] Failed to delete restaurant from DB:', error);
      });
    }
    dispatch(action);
  }, []);

  // Persist state changes to Supabase (skip initial render, debounce)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only save if data actually changed
    const restaurantsJson = JSON.stringify(state.restaurants);
    const tagsJson = JSON.stringify(state.tags);

    if (restaurantsJson === prevRestaurantsRef.current && tagsJson === prevTagsRef.current) {
      return;
    }

    prevRestaurantsRef.current = restaurantsJson;
    prevTagsRef.current = tagsJson;

    // Debounce saves to avoid excessive API calls
    const timeoutId = setTimeout(() => {
      saveData(state.restaurants, state.tags);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state.restaurants, state.tags]);

  return (
    <AppContext.Provider value={{ state, dispatch: enhancedDispatch, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

// === Custom Hook ===

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
