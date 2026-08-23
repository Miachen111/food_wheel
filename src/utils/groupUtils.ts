import { Restaurant, Tag, GroupMode } from '../types';

export interface RestaurantGroup {
  key: string;
  label: string;
  restaurants: Restaurant[];
}

export function groupByStatus(restaurants: Restaurant[]): RestaurantGroup[] {
  const wishList = restaurants.filter(r => r.status === 'WISH_LIST');
  const visited = restaurants.filter(r => r.status === 'VISITED');
  const groups: RestaurantGroup[] = [];
  if (wishList.length > 0) groups.push({ key: 'WISH_LIST', label: '想去清單', restaurants: wishList });
  if (visited.length > 0) groups.push({ key: 'VISITED', label: '已造訪', restaurants: visited });
  return groups;
}

export function groupByBudget(restaurants: Restaurant[]): RestaurantGroup[] {
  const buckets: Record<string, Restaurant[]> = { '$': [], '$$': [], '$$$': [], 'null': [] };
  for (const r of restaurants) {
    const key = r.budgetLevel ?? 'null';
    if (!buckets[key]) buckets[key] = [];
    buckets[key]!.push(r);
  }
  const labels: Record<string, string> = { '$': '$', '$$': '$$', '$$$': '$$$', 'null': '未設定' };
  return Object.entries(buckets)
    .filter(([, list]) => list.length > 0)
    .map(([key, list]) => ({ key, label: labels[key] ?? key, restaurants: list }));
}

export function groupByTag(restaurants: Restaurant[], tags: Tag[]): RestaurantGroup[] {
  const tagMap = new Map(tags.map(t => [t.id, t.name]));
  const groups: Map<string, Restaurant[]> = new Map();
  const noTag: Restaurant[] = [];

  for (const r of restaurants) {
    if (r.tagIds.length === 0) {
      noTag.push(r);
    } else {
      for (const tagId of r.tagIds) {
        if (!groups.has(tagId)) groups.set(tagId, []);
        groups.get(tagId)!.push(r);
      }
    }
  }

  const result: RestaurantGroup[] = [];
  for (const [tagId, list] of groups) {
    result.push({ key: tagId, label: tagMap.get(tagId) ?? tagId, restaurants: list });
  }
  if (noTag.length > 0) {
    result.push({ key: 'no-tag', label: '無標籤', restaurants: noTag });
  }
  return result;
}

export function groupRestaurants(
  restaurants: Restaurant[],
  mode: GroupMode,
  tags: Tag[]
): RestaurantGroup[] {
  switch (mode) {
    case 'status': return groupByStatus(restaurants);
    case 'budget': return groupByBudget(restaurants);
    case 'tag': return groupByTag(restaurants, tags);
    case 'district': return groupByDistrict(restaurants);
  }
}

/**
 * 從地址字串中萃取地區（區/鄉/鎮/市）
 * 例如 "台北市大安區忠孝東路..." → "大安區"
 * 例如 "新北市板橋區..." → "板橋區"
 */
function extractDistrictFromAddress(address: string): string | null {
  // Match patterns like X區, X鄉, X鎮 (but not the city-level 市)
  const match = address.match(/([^\s市縣]{1,4}(?:區|鄉|鎮))/);
  return match ? match[1]! : null;
}

export function groupByDistrict(restaurants: Restaurant[]): RestaurantGroup[] {
  const groups: Map<string, Restaurant[]> = new Map();
  const unknown: Restaurant[] = [];

  for (const r of restaurants) {
    const district = r.district ?? extractDistrictFromAddress(r.address);
    if (district == null) {
      unknown.push(r);
    } else {
      if (!groups.has(district)) groups.set(district, []);
      groups.get(district)!.push(r);
    }
  }

  const result: RestaurantGroup[] = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([district, list]) => ({ key: district, label: district, restaurants: list }));

  if (unknown.length > 0) {
    result.push({ key: 'unknown', label: '未知地區', restaurants: unknown });
  }

  return result;
}
