import { supabase } from './supabaseClient';
import type { Restaurant, Tag } from '../types';

// === Type mapping helpers (DB uses snake_case, app uses camelCase) ===

interface DbRestaurant {
  id: string;
  name: string;
  status: string;
  rating: number | null;
  avg_cost: number | null;
  budget_level: string | null;
  recommended_dishes: string[];
  notes: string;
  address: string;
  tag_ids: string[];
  latitude: number | null;
  longitude: number | null;
  district: string | null;
  created_at: string;
  updated_at: string;
}

function dbToRestaurant(row: DbRestaurant): Restaurant {
  return {
    id: row.id,
    name: row.name,
    status: row.status as Restaurant['status'],
    rating: row.rating,
    avgCost: row.avg_cost,
    budgetLevel: row.budget_level as Restaurant['budgetLevel'],
    recommendedDishes: row.recommended_dishes || [],
    notes: row.notes || '',
    address: row.address || '',
    tagIds: row.tag_ids || [],
    latitude: row.latitude,
    longitude: row.longitude,
    district: row.district,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function restaurantToDb(r: Restaurant): Omit<DbRestaurant, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string } {
  return {
    id: r.id,
    name: r.name,
    status: r.status,
    rating: r.rating,
    avg_cost: r.avgCost,
    budget_level: r.budgetLevel,
    recommended_dishes: r.recommendedDishes,
    notes: r.notes,
    address: r.address,
    tag_ids: r.tagIds.filter((id) => id && id.trim() !== ''),
    latitude: r.latitude,
    longitude: r.longitude,
    district: r.district,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

// === Public API ===

/**
 * 從 Supabase 讀取所有餐廳與標籤
 */
export async function loadData(): Promise<{ restaurants: Restaurant[]; tags: Tag[] } | null> {
  try {
    const [restaurantsRes, tagsRes] = await Promise.all([
      supabase.from('restaurants').select('*').order('created_at', { ascending: false }),
      supabase.from('tags').select('*').order('created_at', { ascending: true }),
    ]);

    if (restaurantsRes.error) {
      console.error('[dataService] Failed to load restaurants:', restaurantsRes.error);
      return null;
    }
    if (tagsRes.error) {
      console.error('[dataService] Failed to load tags:', tagsRes.error);
      return null;
    }

    const restaurants = (restaurantsRes.data as DbRestaurant[]).map(dbToRestaurant);
    const tags: Tag[] = tagsRes.data.map((t: { id: string; name: string }) => ({
      id: t.id,
      name: t.name,
    }));

    return { restaurants, tags };
  } catch (error) {
    console.error('[dataService] Unexpected error loading data:', error);
    return null;
  }
}

/**
 * 儲存（upsert）所有餐廳與標籤到 Supabase
 */
export async function saveData(restaurants: Restaurant[], tags: Tag[]): Promise<boolean> {
  try {
    // Upsert tags
    const tagsToUpsert = tags.map((t) => ({ id: t.id, name: t.name }));
    if (tagsToUpsert.length > 0) {
      const { error: tagError } = await supabase
        .from('tags')
        .upsert(tagsToUpsert, { onConflict: 'id' });
      if (tagError) {
        console.error('[dataService] Failed to save tags:', tagError);
        return false;
      }
    }

    // Upsert restaurants
    const restaurantsToUpsert = restaurants.map(restaurantToDb);
    if (restaurantsToUpsert.length > 0) {
      const { error: restError } = await supabase
        .from('restaurants')
        .upsert(restaurantsToUpsert, { onConflict: 'id' });
      if (restError) {
        console.error('[dataService] Failed to save restaurants:', restError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('[dataService] Unexpected error saving data:', error);
    return false;
  }
}

/**
 * 刪除單一餐廳
 */
export async function deleteRestaurant(id: string): Promise<boolean> {
  const { error } = await supabase.from('restaurants').delete().eq('id', id);
  if (error) {
    console.error('[dataService] Failed to delete restaurant:', error);
    return false;
  }
  return true;
}

/**
 * 刪除單一標籤
 */
export async function deleteTag(id: string): Promise<boolean> {
  const { error } = await supabase.from('tags').delete().eq('id', id);
  if (error) {
    console.error('[dataService] Failed to delete tag:', error);
    return false;
  }
  return true;
}

/**
 * 清除所有資料（危險操作）
 */
export async function clearData(): Promise<void> {
  await supabase.from('restaurants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}
