import React from 'react';
import type { FilterState, StatusFilter, BudgetFilter, Tag } from '../../types';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  candidateCount: number;
  allTags: Tag[];
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'WISH_LIST', label: '想去清單' },
  { value: 'VISITED', label: '已造訪' },
];

const BUDGET_OPTIONS: { value: BudgetFilter; label: string }[] = [
  { value: 'ALL', label: '不限' },
  { value: '$', label: '$' },
  { value: '$$', label: '$$' },
  { value: '$$$', label: '$$$' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  candidateCount,
  allTags,
}) => {
  const handleTagToggle = (tagId: string) => {
    const isSelected = filters.selectedTagIds.includes(tagId);
    const updatedTagIds = isSelected
      ? filters.selectedTagIds.filter(id => id !== tagId)
      : [...filters.selectedTagIds, tagId];
    onChange({ selectedTagIds: updatedTagIds });
  };

  return (
    <div className="space-y-4">
      {/* 狀態篩選 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ status: option.value })}
              className={`px-3 py-2.5 min-h-[44px] text-sm rounded-md border transition-colors ${
                filters.status === option.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 預算篩選 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">預算</label>
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ budget: option.value })}
              className={`px-3 py-2.5 min-h-[44px] text-sm rounded-md border transition-colors ${
                filters.budget === option.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag 篩選 */}
      {allTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const isSelected = filters.selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-2.5 py-1.5 min-h-[36px] rounded-full text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 候選數量 & 重置 */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <span className="text-sm text-gray-600">
          符合條件：<span className="font-medium">{candidateCount}</span> 間餐廳
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          重置篩選
        </button>
      </div>

      {/* 0 候選提示 */}
      {candidateCount === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
          沒有符合條件的餐廳
        </p>
      )}
    </div>
  );
};
