import type { Restaurant, Tag } from '../types';

// === Storage Key Constants ===
const STORAGE_KEYS = {
  RESTAURANTS: 'food-roulette:restaurants',
  TAGS: 'food-roulette:tags',
  INITIALIZED: 'food-roulette:initialized',
} as const;

/**
 * 檢查是否已初始化（是否曾載入過資料）
 */
export function isInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
}

/**
 * 從 localStorage 讀取餐廳與標籤資料
 * @returns 解析後的資料物件，或 null（若資料不存在或損毀）
 */
export function loadData(): { restaurants: Restaurant[]; tags: Tag[] } | null {
  try {
    const restaurantsRaw = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    const tagsRaw = localStorage.getItem(STORAGE_KEYS.TAGS);

    if (restaurantsRaw === null || tagsRaw === null) {
      return null;
    }

    const restaurants: Restaurant[] = JSON.parse(restaurantsRaw);
    const tags: Tag[] = JSON.parse(tagsRaw);

    return { restaurants, tags };
  } catch (error) {
    console.warn(
      '[dataService] Failed to parse localStorage data, returning null:',
      error
    );
    return null;
  }
}

/**
 * 將餐廳與標籤資料寫入 localStorage
 * @returns true 代表寫入成功，false 代表空間不足 (QuotaExceededError)
 */
export function saveData(restaurants: Restaurant[], tags: Tag[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error(
        '[dataService] localStorage quota exceeded. Unable to save data.'
      );
      return false;
    }
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * 設定已初始化旗標
 */
export function markInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

/**
 * 清除所有 food-roulette 相關的 localStorage 資料
 */
export function clearData(): void {
  localStorage.removeItem(STORAGE_KEYS.RESTAURANTS);
  localStorage.removeItem(STORAGE_KEYS.TAGS);
  localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
}
