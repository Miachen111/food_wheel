import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NavigationBar } from './NavigationBar';
import { createContext, useContext } from 'react';
import type { AppState, AppAction } from '../../types';
import { DEFAULT_FILTER } from '../../types';

// Mock the AppContext module
vi.mock('../../context/AppContext', () => {
  return {
    useAppContext: () => useContext(MockContext),
  };
});

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const MockContext = createContext<AppContextValue>(null!);

function createMockState(overrides: Partial<AppState> = {}): AppState {
  return {
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
    ...overrides,
  };
}

function renderWithContext(
  state: AppState,
  dispatch: React.Dispatch<AppAction> = vi.fn()
) {
  return render(
    <MockContext.Provider value={{ state, dispatch }}>
      <NavigationBar />
    </MockContext.Provider>
  );
}

describe('NavigationBar', () => {
  it('renders two navigation items', () => {
    renderWithContext(createMockState());
    expect(screen.getByLabelText('餐廳清單')).toBeInTheDocument();
    expect(screen.getByLabelText('美食轉盤')).toBeInTheDocument();
  });

  it('highlights current page (list)', () => {
    renderWithContext(createMockState({ currentPage: 'list' }));
    const listBtn = screen.getByLabelText('餐廳清單');
    expect(listBtn).toHaveAttribute('aria-current', 'page');
    expect(listBtn.className).toContain('text-indigo-600');

    const rouletteBtn = screen.getByLabelText('美食轉盤');
    expect(rouletteBtn).not.toHaveAttribute('aria-current');
    expect(rouletteBtn.className).toContain('text-gray-500');
  });

  it('highlights current page (roulette)', () => {
    renderWithContext(createMockState({ currentPage: 'roulette' }));
    const rouletteBtn = screen.getByLabelText('美食轉盤');
    expect(rouletteBtn).toHaveAttribute('aria-current', 'page');
    expect(rouletteBtn.className).toContain('text-indigo-600');

    const listBtn = screen.getByLabelText('餐廳清單');
    expect(listBtn).not.toHaveAttribute('aria-current');
    expect(listBtn.className).toContain('text-gray-500');
  });

  it('dispatches NAVIGATE action on click', () => {
    const dispatch = vi.fn();
    renderWithContext(createMockState({ currentPage: 'list' }), dispatch);

    fireEvent.click(screen.getByLabelText('美食轉盤'));
    expect(dispatch).toHaveBeenCalledWith({
      type: 'NAVIGATE',
      payload: { page: 'roulette' },
    });
  });

  it('does not dispatch NAVIGATE when clicking current page', () => {
    const dispatch = vi.fn();
    renderWithContext(createMockState({ currentPage: 'list' }), dispatch);

    fireEvent.click(screen.getByLabelText('餐廳清單'));
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('disables navigation when form is open', () => {
    const dispatch = vi.fn();
    const state = createMockState();
    state.ui.isFormOpen = true;
    renderWithContext(state, dispatch);

    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('pointer-events-none');
    expect(nav.className).toContain('opacity-50');
  });

  it('disables navigation when result modal is open', () => {
    const dispatch = vi.fn();
    const state = createMockState();
    state.ui.resultRestaurantId = 'some-id';
    renderWithContext(state, dispatch);

    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('pointer-events-none');
    expect(nav.className).toContain('opacity-50');
  });

  it('has transition-colors duration-300 classes on buttons', () => {
    renderWithContext(createMockState());
    const listBtn = screen.getByLabelText('餐廳清單');
    expect(listBtn.className).toContain('transition-colors');
    expect(listBtn.className).toContain('duration-300');
  });

  it('has minimum touch target size of 44x44px', () => {
    renderWithContext(createMockState());
    const listBtn = screen.getByLabelText('餐廳清單');
    expect(listBtn.className).toContain('min-w-[44px]');
    expect(listBtn.className).toContain('min-h-[44px]');
  });
});
