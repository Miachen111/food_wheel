import { Restaurant, FilterState } from '../types';

export function filterCandidates(
  restaurants: Restaurant[],
  filters: FilterState
): Restaurant[] {
  return restaurants.filter(r => {
    // 狀態篩選
    if (filters.status !== 'ALL' && r.status !== filters.status) return false;
    // 預算篩選
    if (filters.budget !== 'ALL' && r.budgetLevel !== filters.budget) return false;
    // Tag 篩選（至少符合一個選中的 Tag）
    if (filters.selectedTagIds.length > 0) {
      const hasMatchingTag = filters.selectedTagIds.some(tagId =>
        r.tagIds.includes(tagId)
      );
      if (!hasMatchingTag) return false;
    }
    return true;
  });
}
