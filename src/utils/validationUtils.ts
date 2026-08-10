export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 驗證餐廳名稱
 * - 不可為空或僅空白字元
 * - 最多 100 字元
 */
export function validateRestaurantName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: '餐廳名稱為必填' };
  }
  if (name.length > 100) {
    return { valid: false, error: '名稱不可超過 100 字' };
  }
  return { valid: true };
}

/**
 * 驗證 Tag 名稱
 * - 去除前後空白後長度須為 1-20 字元
 * - 不可為空白
 * - 不可與現有 Tag 名稱重複（不分大小寫比較）
 */
export function validateTagName(name: string, existingTagNames: string[]): ValidationResult {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: '標籤名稱不可為空' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: '標籤名稱不可超過 20 字' };
  }
  const isDuplicate = existingTagNames.some(
    (existing) => existing.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (isDuplicate) {
    return { valid: false, error: '此標籤已存在' };
  }
  return { valid: true };
}

/**
 * 驗證平均消費金額
 * - null 為合法值（選填欄位）
 * - 否則須為正整數且 ≤ 99999
 */
export function validateAvgCost(cost: number | null): ValidationResult {
  if (cost === null) {
    return { valid: true };
  }
  if (!Number.isInteger(cost) || cost <= 0) {
    return { valid: false, error: '請輸入有效金額' };
  }
  if (cost > 99999) {
    return { valid: false, error: '金額不可超過 99999' };
  }
  return { valid: true };
}

/**
 * 驗證推薦菜色名稱
 * - 不可為空
 * - 最多 50 字元
 */
export function validateDishName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: '菜色名稱不可為空' };
  }
  if (name.length > 50) {
    return { valid: false, error: '每道菜名最多 50 字' };
  }
  return { valid: true };
}

/**
 * 驗證筆記
 * - 空字串為合法
 * - 最多 500 字元
 */
export function validateNotes(notes: string): ValidationResult {
  if (notes.length > 500) {
    return { valid: false, error: '筆記不可超過 500 字' };
  }
  return { valid: true };
}
