import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Restaurant, Tag } from '../types';

// Mock supabaseClient before importing dataService
vi.mock('./supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { loadData, saveData, deleteRestaurant, deleteTag, clearData } from './dataService';
import { supabase } from './supabaseClient';

// Helper to build a minimal Restaurant for testing
function makeRestaurant(overrides: Partial<Restaurant> = {}): Restaurant {
  return {
    id: 'test-id-1',
    name: 'Test Restaurant',
    status: 'VISITED',
    rating: 4.0,
    avgCost: 300,
    budgetLevel: '$$',
    recommendedDishes: ['Dish A'],
    notes: 'Great place',
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

function makeTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: 'tag-1',
    name: '快餐',
    ...overrides,
  };
}

// Helper to create chainable mock
function createChainMock(result: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(result),
    upsert: vi.fn().mockResolvedValue(result),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue(result),
    neq: vi.fn().mockResolvedValue(result),
  };
  return chain;
}

describe('dataService (Supabase)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadData', () => {
    it('returns restaurants and tags on success', async () => {
      const dbRestaurant = {
        id: 'test-id-1',
        name: 'Test Restaurant',
        status: 'VISITED',
        rating: 4.0,
        avg_cost: 300,
        budget_level: '$$',
        recommended_dishes: ['Dish A'],
        notes: 'Great place',
        address: '',
        tag_ids: ['tag-1'],
        latitude: null,
        longitude: null,
        district: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      const dbTag = { id: 'tag-1', name: '快餐' };

      const restaurantChain = createChainMock({ data: [dbRestaurant], error: null });
      const tagChain = createChainMock({ data: [dbTag], error: null });

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        return (callCount === 1 ? restaurantChain : tagChain) as unknown as ReturnType<typeof supabase.from>;
      });

      const result = await loadData();
      expect(result).not.toBeNull();
      expect(result!.restaurants).toHaveLength(1);
      expect(result!.restaurants[0]!.name).toBe('Test Restaurant');
      expect(result!.restaurants[0]!.avgCost).toBe(300);
      expect(result!.tags).toHaveLength(1);
      expect(result!.tags[0]!.name).toBe('快餐');
    });

    it('returns null on restaurant fetch error', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const restaurantChain = createChainMock({ data: null, error: { message: 'fetch error' } });
      const tagChain = createChainMock({ data: [], error: null });

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        return (callCount === 1 ? restaurantChain : tagChain) as unknown as ReturnType<typeof supabase.from>;
      });

      const result = await loadData();
      expect(result).toBeNull();
      errorSpy.mockRestore();
    });
  });

  describe('saveData', () => {
    it('upserts tags and restaurants', async () => {
      const chain = createChainMock({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>);

      const result = await saveData([makeRestaurant()], [makeTag()]);
      expect(result).toBe(true);
    });

    it('returns false on tag upsert error', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const chain = createChainMock({ data: null, error: { message: 'upsert error' } });
      vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>);

      const result = await saveData([], [makeTag()]);
      expect(result).toBe(false);
      errorSpy.mockRestore();
    });
  });

  describe('deleteRestaurant', () => {
    it('returns true on success', async () => {
      const chain = createChainMock({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>);

      const result = await deleteRestaurant('test-id');
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const chain = createChainMock({ data: null, error: { message: 'delete error' } });
      vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>);

      const result = await deleteRestaurant('test-id');
      expect(result).toBe(false);
      errorSpy.mockRestore();
    });
  });

  describe('deleteTag', () => {
    it('returns true on success', async () => {
      const chain = createChainMock({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>);

      const result = await deleteTag('tag-id');
      expect(result).toBe(true);
    });
  });

  describe('clearData', () => {
    it('deletes all restaurants and tags', async () => {
      const chain = createChainMock({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue(chain as unknown as ReturnType<typeof supabase.from>);

      await clearData();
      expect(supabase.from).toHaveBeenCalledWith('restaurants');
      expect(supabase.from).toHaveBeenCalledWith('tags');
    });
  });
});
