import { describe, it, expect } from 'vitest';
import { Restaurant, Tag } from '../types';
import {
  groupByStatus,
  groupByBudget,
  groupByTag,
  groupRestaurants,
} from './groupUtils';

function makeRestaurant(overrides: Partial<Restaurant> = {}): Restaurant {
  return {
    id: 'r1',
    name: 'Test Restaurant',
    status: 'WISH_LIST',
    rating: null,
    avgCost: null,
    budgetLevel: null,
    recommendedDishes: [],
    notes: '',
    address: '',
    tagIds: [],
    latitude: null,
    longitude: null,
    district: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('groupByStatus', () => {
  it('returns empty array for empty input', () => {
    expect(groupByStatus([])).toEqual([]);
  });

  it('groups restaurants by status', () => {
    const restaurants: Restaurant[] = [
      makeRestaurant({ id: '1', status: 'WISH_LIST' }),
      makeRestaurant({ id: '2', status: 'VISITED' }),
      makeRestaurant({ id: '3', status: 'WISH_LIST' }),
    ];
    const groups = groupByStatus(restaurants);
    expect(groups).toHaveLength(2);
    expect(groups[0]!.key).toBe('WISH_LIST');
    expect(groups[0]!.label).toBe('想去清單');
    expect(groups[0]!.restaurants).toHaveLength(2);
    expect(groups[1]!.key).toBe('VISITED');
    expect(groups[1]!.label).toBe('已造訪');
    expect(groups[1]!.restaurants).toHaveLength(1);
  });

  it('omits groups with no restaurants', () => {
    const restaurants: Restaurant[] = [
      makeRestaurant({ id: '1', status: 'VISITED' }),
    ];
    const groups = groupByStatus(restaurants);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.key).toBe('VISITED');
  });
});

describe('groupByBudget', () => {
  it('returns empty array for empty input', () => {
    expect(groupByBudget([])).toEqual([]);
  });

  it('groups restaurants by budget level', () => {
    const restaurants: Restaurant[] = [
      makeRestaurant({ id: '1', budgetLevel: '$' }),
      makeRestaurant({ id: '2', budgetLevel: '$$' }),
      makeRestaurant({ id: '3', budgetLevel: '$' }),
      makeRestaurant({ id: '4', budgetLevel: null }),
    ];
    const groups = groupByBudget(restaurants);
    const keys = groups.map(g => g.key);
    expect(keys).toContain('$');
    expect(keys).toContain('$$');
    expect(keys).toContain('null');
    expect(keys).not.toContain('$$$');

    const dollarGroup = groups.find(g => g.key === '$')!;
    expect(dollarGroup.restaurants).toHaveLength(2);
    expect(dollarGroup.label).toBe('$');

    const nullGroup = groups.find(g => g.key === 'null')!;
    expect(nullGroup.label).toBe('未設定');
    expect(nullGroup.restaurants).toHaveLength(1);
  });
});

describe('groupByTag', () => {
  const tags: Tag[] = [
    { id: 'tag1', name: '日式' },
    { id: 'tag2', name: '義式' },
  ];

  it('returns empty array for empty input', () => {
    expect(groupByTag([], tags)).toEqual([]);
  });

  it('groups restaurants by tag', () => {
    const restaurants: Restaurant[] = [
      makeRestaurant({ id: '1', tagIds: ['tag1'] }),
      makeRestaurant({ id: '2', tagIds: ['tag2'] }),
      makeRestaurant({ id: '3', tagIds: ['tag1', 'tag2'] }),
    ];
    const groups = groupByTag(restaurants, tags);
    const tag1Group = groups.find(g => g.key === 'tag1')!;
    expect(tag1Group.label).toBe('日式');
    expect(tag1Group.restaurants).toHaveLength(2); // r1 and r3

    const tag2Group = groups.find(g => g.key === 'tag2')!;
    expect(tag2Group.label).toBe('義式');
    expect(tag2Group.restaurants).toHaveLength(2); // r2 and r3
  });

  it('puts restaurants with no tags in the "無標籤" group', () => {
    const restaurants: Restaurant[] = [
      makeRestaurant({ id: '1', tagIds: [] }),
      makeRestaurant({ id: '2', tagIds: ['tag1'] }),
    ];
    const groups = groupByTag(restaurants, tags);
    const noTagGroup = groups.find(g => g.key === 'no-tag')!;
    expect(noTagGroup.label).toBe('無標籤');
    expect(noTagGroup.restaurants).toHaveLength(1);
  });

  it('uses tagId as fallback label when tag is not found', () => {
    const restaurants: Restaurant[] = [
      makeRestaurant({ id: '1', tagIds: ['unknown-tag'] }),
    ];
    const groups = groupByTag(restaurants, tags);
    expect(groups[0]!.key).toBe('unknown-tag');
    expect(groups[0]!.label).toBe('unknown-tag');
  });
});

describe('groupRestaurants', () => {
  const tags: Tag[] = [{ id: 'tag1', name: '日式' }];

  it('dispatches to groupByStatus for mode "status"', () => {
    const restaurants: Restaurant[] = [
      makeRestaurant({ id: '1', status: 'WISH_LIST' }),
    ];
    const groups = groupRestaurants(restaurants, 'status', tags);
    expect(groups[0]!.key).toBe('WISH_LIST');
  });

  it('dispatches to groupByBudget for mode "budget"', () => {
    const restaurants: Restaurant[] = [
      makeRestaurant({ id: '1', budgetLevel: '$$' }),
    ];
    const groups = groupRestaurants(restaurants, 'budget', tags);
    expect(groups[0]!.key).toBe('$$');
  });

  it('dispatches to groupByTag for mode "tag"', () => {
    const restaurants: Restaurant[] = [
      makeRestaurant({ id: '1', tagIds: ['tag1'] }),
    ];
    const groups = groupRestaurants(restaurants, 'tag', tags);
    expect(groups[0]!.key).toBe('tag1');
    expect(groups[0]!.label).toBe('日式');
  });
});
