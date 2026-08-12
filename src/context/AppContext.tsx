import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { AppState, AppAction } from '../types';
import { DEFAULT_FILTER } from '../types';
import { appReducer } from './appReducer';
import { isInitialized, loadData, saveData, markInitialized } from '../services/dataService';

// === Initial State ===

const initialState: AppState = {
  restaurants: [],
  tags: [],
  filters: DEFAULT_FILTER,
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
}

const AppContext = createContext<AppContextValue | null>(null);

// === Provider ===

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const isFirstRender = useRef(true);

  // On mount: load data from localStorage or initialize with dummy data
  useEffect(() => {
    if (isInitialized()) {
      const data = loadData();
      if (data) {
        dispatch({ type: 'LOAD_DATA', payload: data });
      }
    } else {
      // First time: start with empty data
      markInitialized();
    }
  }, []);

  // Persist state changes to localStorage (skip initial render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveData(state.restaurants, state.tags);
  }, [state.restaurants, state.tags]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
