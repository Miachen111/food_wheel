import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isInitialized,
  loadData,
  saveData,
  markInitialized,
  clearData,
} from './dataService';
import type { Restaurant, Tag } from '../types';

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
    tagIds: ['tag-1'],
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

describe('dataService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isInitialized', () => {
    it('returns false when no initialized flag exists', () => {
      expect(isInitialized()).toBe(false);
    });

    it('returns true when initialized flag is "true"', () => {
      localStorage.setItem('food-roulette:initialized', 'true');
      expect(isInitialized()).toBe(true);
    });

    it('returns false when initialized flag is not "true"', () => {
      localStorage.setItem('food-roulette:initialized', 'false');
      expect(isInitialized()).toBe(false);
    });
  });

  describe('loadData', () => {
    it('returns null when no data exists', () => {
      expect(loadData()).toBeNull();
    });

    it('returns null when only restaurants exist', () => {
      localStorage.setItem('food-roulette:restaurants', '[]');
      expect(loadData()).toBeNull();
    });

    it('returns null when only tags exist', () => {
      localStorage.setItem('food-roulette:tags', '[]');
      expect(loadData()).toBeNull();
    });

    it('returns parsed data when both keys exist', () => {
      const restaurants = [makeRestaurant()];
      const tags = [makeTag()];
      localStorage.setItem(
        'food-roulette:restaurants',
        JSON.stringify(restaurants)
      );
      localStorage.setItem('food-roulette:tags', JSON.stringify(tags));

      const result = loadData();
      expect(result).not.toBeNull();
      expect(result!.restaurants).toEqual(restaurants);
      expect(result!.tags).toEqual(tags);
    });

    it('returns null and warns when JSON is corrupted', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem('food-roulette:restaurants', '{invalid json');
      localStorage.setItem('food-roulette:tags', '[]');

      const result = loadData();
      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('saveData', () => {
    it('saves restaurants and tags to localStorage', () => {
      const restaurants = [makeRestaurant()];
      const tags = [makeTag()];

      const result = saveData(restaurants, tags);
      expect(result).toBe(true);

      expect(localStorage.getItem('food-roulette:restaurants')).toBe(
        JSON.stringify(restaurants)
      );
      expect(localStorage.getItem('food-roulette:tags')).toBe(
        JSON.stringify(tags)
      );
    });

    it('returns false on QuotaExceededError', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const quotaError = new DOMException(
        'Storage quota exceeded',
        'QuotaExceededError'
      );
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaError;
      });

      const result = saveData([], []);
      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('re-throws unexpected errors', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Unexpected');
      });

      expect(() => saveData([], [])).toThrow('Unexpected');
      vi.restoreAllMocks();
    });
  });

  describe('markInitialized', () => {
    it('sets the initialized flag to "true"', () => {
      markInitialized();
      expect(localStorage.getItem('food-roulette:initialized')).toBe('true');
    });
  });

  describe('clearData', () => {
    it('removes all food-roulette keys', () => {
      localStorage.setItem('food-roulette:restaurants', '[]');
      localStorage.setItem('food-roulette:tags', '[]');
      localStorage.setItem('food-roulette:initialized', 'true');

      clearData();

      expect(localStorage.getItem('food-roulette:restaurants')).toBeNull();
      expect(localStorage.getItem('food-roulette:tags')).toBeNull();
      expect(localStorage.getItem('food-roulette:initialized')).toBeNull();
    });

    it('does not affect other localStorage keys', () => {
      localStorage.setItem('other-key', 'value');
      localStorage.setItem('food-roulette:restaurants', '[]');

      clearData();

      expect(localStorage.getItem('other-key')).toBe('value');
    });
  });
});
