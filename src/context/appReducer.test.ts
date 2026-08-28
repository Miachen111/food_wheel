import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appReducer } from './appReducer';
import { AppState, DEFAULT_FILTER, RestaurantFormData, Restaurant, Tag } from '../types';

// Mock crypto.randomUUID
const mockUUID = '00000000-0000-0000-0000-000000000001';
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => mockUUID),
});

function createInitialState(overrides?: Partial<AppState>): AppState {
  return {
    restaurants: [],
    tags: [],
    filters: { ...DEFAULT_FILTER },
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

function createRestaurant(overrides?: Partial<Restaurant>): Restaurant {
  return {
    id: 'rest-1',
    name: '測試餐廳',
    status: 'VISITED',
    rating: 4.0,
    avgCost: 350,
    budgetLevel: '$$',
    recommendedDishes: ['牛肉麵'],
    notes: '好吃',
    address: '',
    tagIds: ['tag-1'],
    latitude: null,
    longitude: null,
    district: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('appReducer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
  });

  describe('ADD_RESTAURANT', () => {
    it('should add a VISITED restaurant with generated id and timestamps', () => {
      const state = createInitialState();
      const formData: RestaurantFormData = {
        name: '新餐廳',
        status: 'VISITED',
        rating: 4.5,
        avgCost: 500,
        recommendedDishes: ['拉麵'],
        notes: '不錯',
        tagIds: ['tag-1'],
      };

      const result = appReducer(state, { type: 'ADD_RESTAURANT', payload: formData });

      expect(result.restaurants).toHaveLength(1);
      const added = result.restaurants[0]!;
      expect(added.id).toBe(mockUUID);
      expect(added.name).toBe('新餐廳');
      expect(added.status).toBe('VISITED');
      expect(added.rating).toBe(4.5);
      expect(added.avgCost).toBe(500);
      expect(added.budgetLevel).toBe('$$');
      expect(added.recommendedDishes).toEqual(['拉麵']);
      expect(added.createdAt).toBe('2024-06-15T12:00:00.000Z');
      expect(added.updatedAt).toBe('2024-06-15T12:00:00.000Z');
    });

    it('should clear rating, avgCost, recommendedDishes, budgetLevel for WISH_LIST', () => {
      const state = createInitialState();
      const formData: RestaurantFormData = {
        name: '想去的店',
        status: 'WISH_LIST',
        rating: 3.0,
        avgCost: 200,
        recommendedDishes: ['pizza'],
        notes: '',
        tagIds: [],
      };

      const result = appReducer(state, { type: 'ADD_RESTAURANT', payload: formData });

      const added = result.restaurants[0]!;
      expect(added.rating).toBeNull();
      expect(added.avgCost).toBeNull();
      expect(added.budgetLevel).toBeNull();
      expect(added.recommendedDishes).toEqual([]);
    });

    it('should preserve the provided budgetLevel for WISH_LIST (e.g. $$$$)', () => {
      const state = createInitialState();
      const formData: RestaurantFormData = {
        name: '想去的高級店',
        status: 'WISH_LIST',
        rating: null,
        avgCost: null,
        budgetLevel: '$$$$',
        recommendedDishes: [],
        notes: '',
        tagIds: [],
      };

      const result = appReducer(state, { type: 'ADD_RESTAURANT', payload: formData });

      const added = result.restaurants[0]!;
      expect(added.status).toBe('WISH_LIST');
      expect(added.budgetLevel).toBe('$$$$');
      expect(added.avgCost).toBeNull();
    });

    it('should add new restaurant to the BEGINNING of the array', () => {
      const existing = createRestaurant({ id: 'existing-1', name: '舊餐廳' });
      const state = createInitialState({ restaurants: [existing] });
      const formData: RestaurantFormData = {
        name: '新餐廳',
        status: 'VISITED',
        rating: 3.5,
        avgCost: 100,
        recommendedDishes: [],
        notes: '',
        tagIds: [],
      };

      const result = appReducer(state, { type: 'ADD_RESTAURANT', payload: formData });

      expect(result.restaurants).toHaveLength(2);
      expect(result.restaurants[0]!.name).toBe('新餐廳');
      expect(result.restaurants[1]!.name).toBe('舊餐廳');
    });

    it('should derive budgetLevel correctly based on avgCost', () => {
      const state = createInitialState();

      // avgCost <= 200 → '$'
      let result = appReducer(state, {
        type: 'ADD_RESTAURANT',
        payload: { name: 'A', status: 'VISITED', rating: 3, avgCost: 200, recommendedDishes: [], notes: '', tagIds: [] },
      });
      expect(result.restaurants[0]!.budgetLevel).toBe('$');

      // avgCost <= 600 → '$$'
      result = appReducer(state, {
        type: 'ADD_RESTAURANT',
        payload: { name: 'B', status: 'VISITED', rating: 3, avgCost: 600, recommendedDishes: [], notes: '', tagIds: [] },
      });
      expect(result.restaurants[0]!.budgetLevel).toBe('$$');

      // avgCost > 600 → '$$$'
      result = appReducer(state, {
        type: 'ADD_RESTAURANT',
        payload: { name: 'C', status: 'VISITED', rating: 3, avgCost: 601, recommendedDishes: [], notes: '', tagIds: [] },
      });
      expect(result.restaurants[0]!.budgetLevel).toBe('$$$');
    });
  });

  describe('UPDATE_RESTAURANT', () => {
    it('should update restaurant data and updatedAt', () => {
      const existing = createRestaurant({ id: 'rest-1', name: '舊名', rating: 3.0, avgCost: 200 });
      const state = createInitialState({ restaurants: [existing] });

      const result = appReducer(state, {
        type: 'UPDATE_RESTAURANT',
        payload: {
          id: 'rest-1',
          data: { name: '新名', status: 'VISITED', rating: 4.5, avgCost: 700, recommendedDishes: ['A'], notes: '更新', tagIds: [] },
        },
      });

      const updated = result.restaurants[0]!;
      expect(updated.name).toBe('新名');
      expect(updated.rating).toBe(4.5);
      expect(updated.avgCost).toBe(700);
      expect(updated.budgetLevel).toBe('$$$');
      expect(updated.updatedAt).toBe('2024-06-15T12:00:00.000Z');
      expect(updated.createdAt).toBe('2024-01-01T00:00:00.000Z'); // unchanged
    });

    it('should clear rating, avgCost, recommendedDishes, budgetLevel when status changes from VISITED to WISH_LIST', () => {
      const existing = createRestaurant({
        id: 'rest-1',
        status: 'VISITED',
        rating: 4.0,
        avgCost: 500,
        recommendedDishes: ['牛肉麵', '小菜'],
      });
      const state = createInitialState({ restaurants: [existing] });

      const result = appReducer(state, {
        type: 'UPDATE_RESTAURANT',
        payload: {
          id: 'rest-1',
          data: { name: '測試餐廳', status: 'WISH_LIST', rating: 4.0, avgCost: 500, recommendedDishes: ['牛肉麵'], notes: '好吃', tagIds: ['tag-1'] },
        },
      });

      const updated = result.restaurants[0]!;
      expect(updated.status).toBe('WISH_LIST');
      expect(updated.rating).toBeNull();
      expect(updated.avgCost).toBeNull();
      expect(updated.budgetLevel).toBeNull();
      expect(updated.recommendedDishes).toEqual([]);
    });

    it('should NOT clear fields when status stays WISH_LIST', () => {
      const existing = createRestaurant({
        id: 'rest-1',
        status: 'WISH_LIST',
        rating: null,
        avgCost: null,
        budgetLevel: null,
        recommendedDishes: [],
      });
      const state = createInitialState({ restaurants: [existing] });

      const result = appReducer(state, {
        type: 'UPDATE_RESTAURANT',
        payload: {
          id: 'rest-1',
          data: { name: '更新名稱', status: 'WISH_LIST', rating: null, avgCost: null, recommendedDishes: [], notes: '', tagIds: [] },
        },
      });

      const updated = result.restaurants[0]!;
      expect(updated.name).toBe('更新名稱');
      expect(updated.rating).toBeNull();
      expect(updated.avgCost).toBeNull();
    });

    it('should preserve/update budgetLevel when editing an existing WISH_LIST restaurant', () => {
      const existing = createRestaurant({
        id: 'rest-1',
        status: 'WISH_LIST',
        rating: null,
        avgCost: null,
        budgetLevel: '$$',
        recommendedDishes: [],
      });
      const state = createInitialState({ restaurants: [existing] });

      const result = appReducer(state, {
        type: 'UPDATE_RESTAURANT',
        payload: {
          id: 'rest-1',
          data: {
            name: '想去的店',
            status: 'WISH_LIST',
            rating: null,
            avgCost: null,
            budgetLevel: '$$$$',
            recommendedDishes: [],
            notes: '',
            tagIds: [],
          },
        },
      });

      const updated = result.restaurants[0]!;
      expect(updated.status).toBe('WISH_LIST');
      expect(updated.budgetLevel).toBe('$$$$');
      expect(updated.avgCost).toBeNull();
    });

    it('should not modify other restaurants', () => {
      const r1 = createRestaurant({ id: 'rest-1', name: 'R1' });
      const r2 = createRestaurant({ id: 'rest-2', name: 'R2' });
      const state = createInitialState({ restaurants: [r1, r2] });

      const result = appReducer(state, {
        type: 'UPDATE_RESTAURANT',
        payload: {
          id: 'rest-1',
          data: { name: '更新R1', status: 'VISITED', rating: 5, avgCost: 100, recommendedDishes: [], notes: '', tagIds: [] },
        },
      });

      expect(result.restaurants[1]!.name).toBe('R2');
    });
  });

  describe('DELETE_RESTAURANT', () => {
    it('should remove restaurant by id', () => {
      const r1 = createRestaurant({ id: 'rest-1' });
      const r2 = createRestaurant({ id: 'rest-2' });
      const state = createInitialState({ restaurants: [r1, r2] });

      const result = appReducer(state, { type: 'DELETE_RESTAURANT', payload: { id: 'rest-1' } });

      expect(result.restaurants).toHaveLength(1);
      expect(result.restaurants[0]!.id).toBe('rest-2');
    });

    it('should return same state if id not found', () => {
      const r1 = createRestaurant({ id: 'rest-1' });
      const state = createInitialState({ restaurants: [r1] });

      const result = appReducer(state, { type: 'DELETE_RESTAURANT', payload: { id: 'nonexistent' } });

      expect(result.restaurants).toHaveLength(1);
    });

    it('should also remove deleted restaurant ID from selectedRestaurantIds', () => {
      const r1 = createRestaurant({ id: 'rest-1' });
      const r2 = createRestaurant({ id: 'rest-2' });
      const state = createInitialState({
        restaurants: [r1, r2],
        selectedRestaurantIds: ['rest-1', 'rest-2'],
      });

      const result = appReducer(state, { type: 'DELETE_RESTAURANT', payload: { id: 'rest-1' } });

      expect(result.selectedRestaurantIds).toEqual(['rest-2']);
    });
  });

  describe('TOGGLE_RESTAURANT_SELECTION', () => {
    it('should add restaurant ID to selectedRestaurantIds when not selected', () => {
      const state = createInitialState({ selectedRestaurantIds: [] });

      const result = appReducer(state, {
        type: 'TOGGLE_RESTAURANT_SELECTION',
        payload: { id: 'rest-1' },
      });

      expect(result.selectedRestaurantIds).toEqual(['rest-1']);
    });

    it('should remove restaurant ID from selectedRestaurantIds when already selected', () => {
      const state = createInitialState({ selectedRestaurantIds: ['rest-1', 'rest-2'] });

      const result = appReducer(state, {
        type: 'TOGGLE_RESTAURANT_SELECTION',
        payload: { id: 'rest-1' },
      });

      expect(result.selectedRestaurantIds).toEqual(['rest-2']);
    });

    it('should not affect other state fields', () => {
      const r1 = createRestaurant({ id: 'rest-1' });
      const state = createInitialState({ restaurants: [r1], selectedRestaurantIds: [] });

      const result = appReducer(state, {
        type: 'TOGGLE_RESTAURANT_SELECTION',
        payload: { id: 'rest-1' },
      });

      expect(result.restaurants).toEqual([r1]);
      expect(result.currentPage).toBe('list');
    });
  });

  describe('CLEAR_SELECTION', () => {
    it('should reset selectedRestaurantIds to empty array', () => {
      const state = createInitialState({ selectedRestaurantIds: ['rest-1', 'rest-2', 'rest-3'] });

      const result = appReducer(state, { type: 'CLEAR_SELECTION' });

      expect(result.selectedRestaurantIds).toEqual([]);
    });

    it('should not affect other state fields', () => {
      const r1 = createRestaurant({ id: 'rest-1' });
      const state = createInitialState({
        restaurants: [r1],
        selectedRestaurantIds: ['rest-1'],
      });

      const result = appReducer(state, { type: 'CLEAR_SELECTION' });

      expect(result.restaurants).toEqual([r1]);
      expect(result.currentPage).toBe('list');
    });
  });

  describe('ADD_TAG', () => {
    it('should add a new tag with trimmed name and generated id', () => {
      const state = createInitialState();

      const result = appReducer(state, { type: 'ADD_TAG', payload: { name: '  日式  ' } });

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0]!.id).toBe(mockUUID);
      expect(result.tags[0]!.name).toBe('日式');
    });

    it('should not add duplicate tag (case-insensitive)', () => {
      const existingTag: Tag = { id: 'tag-1', name: '日式' };
      const state = createInitialState({ tags: [existingTag] });

      const result = appReducer(state, { type: 'ADD_TAG', payload: { name: '日式' } });
      expect(result.tags).toHaveLength(1);

      const result2 = appReducer(state, { type: 'ADD_TAG', payload: { name: '  日式  ' } });
      expect(result2.tags).toHaveLength(1);
    });

    it('should allow adding tag with different name', () => {
      const existingTag: Tag = { id: 'tag-1', name: '日式' };
      const state = createInitialState({ tags: [existingTag] });

      const result = appReducer(state, { type: 'ADD_TAG', payload: { name: '中式' } });

      expect(result.tags).toHaveLength(2);
      expect(result.tags[1]!.name).toBe('中式');
    });
  });

  describe('SET_FILTERS', () => {
    it('should merge partial filters', () => {
      const state = createInitialState();

      const result = appReducer(state, { type: 'SET_FILTERS', payload: { status: 'VISITED' } });

      expect(result.filters.status).toBe('VISITED');
      expect(result.filters.budget).toBe('ALL'); // unchanged
      expect(result.filters.selectedTagIds).toEqual([]); // unchanged
    });

    it('should merge multiple filter fields', () => {
      const state = createInitialState();

      const result = appReducer(state, {
        type: 'SET_FILTERS',
        payload: { status: 'WISH_LIST', budget: '$$', selectedTagIds: ['tag-1'] },
      });

      expect(result.filters.status).toBe('WISH_LIST');
      expect(result.filters.budget).toBe('$$');
      expect(result.filters.selectedTagIds).toEqual(['tag-1']);
    });
  });

  describe('RESET_FILTERS', () => {
    it('should reset filters to default', () => {
      const state = createInitialState({
        filters: { status: 'VISITED', budget: '$$$', selectedTagIds: ['tag-1', 'tag-2'] },
      });

      const result = appReducer(state, { type: 'RESET_FILTERS' });

      expect(result.filters).toEqual(DEFAULT_FILTER);
    });
  });

  describe('NAVIGATE', () => {
    it('should set currentPage', () => {
      const state = createInitialState({ currentPage: 'list' });

      const result = appReducer(state, { type: 'NAVIGATE', payload: { page: 'roulette' } });

      expect(result.currentPage).toBe('roulette');
    });
  });

  describe('SET_UI', () => {
    it('should merge partial ui state', () => {
      const state = createInitialState();

      const result = appReducer(state, { type: 'SET_UI', payload: { isFormOpen: true } });

      expect(result.ui.isFormOpen).toBe(true);
      expect(result.ui.editingRestaurantId).toBeNull(); // unchanged
    });

    it('should update multiple ui fields', () => {
      const state = createInitialState();

      const result = appReducer(state, {
        type: 'SET_UI',
        payload: { isFormOpen: true, editingRestaurantId: 'rest-1' },
      });

      expect(result.ui.isFormOpen).toBe(true);
      expect(result.ui.editingRestaurantId).toBe('rest-1');
    });
  });

  describe('LOAD_DATA', () => {
    it('should set restaurants and tags from payload', () => {
      const state = createInitialState();
      const restaurants = [createRestaurant({ id: 'r1' }), createRestaurant({ id: 'r2' })];
      const tags: Tag[] = [{ id: 't1', name: 'Tag1' }];

      const result = appReducer(state, { type: 'LOAD_DATA', payload: { restaurants, tags } });

      expect(result.restaurants).toHaveLength(2);
      expect(result.tags).toHaveLength(1);
      expect(result.restaurants).toStrictEqual(restaurants);
      expect(result.tags).toBe(tags);
    });

    it('should normalize old data missing latitude/longitude/district to null', () => {
      const state = createInitialState();
      // Simulate old data without location fields
      const oldRestaurants = [
        createRestaurant({ id: 'r1' }),
        createRestaurant({ id: 'r2' }),
      ].map(({ latitude, longitude, district, ...rest }) => rest) as any[];
      const tags: Tag[] = [{ id: 't1', name: 'Tag1' }];

      const result = appReducer(state, { type: 'LOAD_DATA', payload: { restaurants: oldRestaurants, tags } });

      expect(result.restaurants[0]!.latitude).toBeNull();
      expect(result.restaurants[0]!.longitude).toBeNull();
      expect(result.restaurants[0]!.district).toBeNull();
      expect(result.restaurants[1]!.latitude).toBeNull();
      expect(result.restaurants[1]!.longitude).toBeNull();
      expect(result.restaurants[1]!.district).toBeNull();
    });
  });

  describe('default case', () => {
    it('should return state for unknown action', () => {
      const state = createInitialState();
      // @ts-expect-error testing unknown action
      const result = appReducer(state, { type: 'UNKNOWN_ACTION' });
      expect(result).toBe(state);
    });
  });
});
