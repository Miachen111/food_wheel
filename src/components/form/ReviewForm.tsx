import { useState, useEffect, useCallback } from 'react';
import StarRating from './StarRating';
import { DishInput } from './DishInput';
import { TagInput } from './TagInput';
import { PlaceSearch } from './PlaceSearch';
import {
  validateRestaurantName,
  validateAvgCost,
  validateNotes,
} from '../../utils/validationUtils';
import { priceLevelToBudgetLevel } from '../../utils/placesApi';
import type { BudgetLevel, Restaurant, RestaurantFormData, RestaurantStatus, Tag } from '../../types';

export interface ReviewFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Restaurant>;
  onSubmit: (data: RestaurantFormData) => void;
  onCancel: () => void;
  allTags: Tag[];
  onAddNewTag: (name: string) => string;
}

interface FormErrors {
  name?: string;
  avgCost?: string;
  notes?: string;
}

export function ReviewForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  allTags,
  onAddNewTag,
}: ReviewFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [status, setStatus] = useState<RestaurantStatus>(initialData?.status ?? 'VISITED');
  const [rating, setRating] = useState<number | null>(initialData?.rating ?? null);
  const [avgCost, setAvgCost] = useState<string>(
    initialData?.avgCost != null ? String(initialData.avgCost) : ''
  );
  const [recommendedDishes, setRecommendedDishes] = useState<string[]>(
    initialData?.recommendedDishes ?? []
  );
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel | null>(
    initialData?.budgetLevel ?? null
  );
  const [tagIds, setTagIds] = useState<string[]>(initialData?.tagIds ?? []);
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [errors, setErrors] = useState<FormErrors>({});

  // Lock body scroll when form is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // When status changes to WISH_LIST, clear visit-related fields
  const handleStatusChange = (newStatus: RestaurantStatus) => {
    setStatus(newStatus);
    if (newStatus === 'WISH_LIST') {
      setRating(null);
      setAvgCost('');
      setRecommendedDishes([]);
      // Clear related errors
      setErrors((prev) => ({ ...prev, avgCost: undefined }));
    } else {
      // VISITED uses avgCost as its budget source; clear the WISH_LIST budgetLevel
      setBudgetLevel(null);
    }
  };

  // Blur validation
  const handleNameBlur = useCallback(() => {
    const result = validateRestaurantName(name);
    setErrors((prev) => ({ ...prev, name: result.valid ? undefined : result.error }));
  }, [name]);

  const handleAvgCostBlur = useCallback(() => {
    if (status === 'WISH_LIST') return;
    const parsed = avgCost.trim() === '' ? null : Number(avgCost);
    const result = validateAvgCost(parsed);
    setErrors((prev) => ({ ...prev, avgCost: result.valid ? undefined : result.error }));
  }, [avgCost, status]);

  const handleNotesBlur = useCallback(() => {
    const result = validateNotes(notes);
    setErrors((prev) => ({ ...prev, notes: result.valid ? undefined : result.error }));
  }, [notes]);

  const handlePlaceSelect = (place: {
    name: string;
    address: string;
    rating: number | null;
    placeId: string;
    priceLevel: string | null;
  }) => {
    setName(place.name);
    setAddress(place.address);
    if (place.rating !== null) {
      // Round to nearest 0.5
      setRating(Math.round(place.rating * 2) / 2);
    }
    // Auto-fill budget level from Google price level; only override when mappable
    const mapped = priceLevelToBudgetLevel(place.priceLevel);
    if (mapped !== null) {
      setBudgetLevel(mapped);
    }
    // Clear name error if present
    setErrors((prev) => ({ ...prev, name: undefined }));
  };

  // Submit with full validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameResult = validateRestaurantName(name);
    const parsedCost = avgCost.trim() === '' ? null : Number(avgCost);
    const costResult = status === 'VISITED' ? validateAvgCost(parsedCost) : { valid: true };
    const notesResult = validateNotes(notes);

    const newErrors: FormErrors = {};
    if (!nameResult.valid) newErrors.name = nameResult.error;
    if (!costResult.valid) newErrors.avgCost = costResult.error;
    if (!notesResult.valid) newErrors.notes = notesResult.error;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData: RestaurantFormData = {
      name: name.trim(),
      status,
      rating: status === 'WISH_LIST' ? null : rating,
      avgCost: status === 'WISH_LIST' ? null : parsedCost,
      // WISH_LIST carries the user/auto-filled budgetLevel; VISITED derives it
      // downstream in the reducer from avgCost, so leave it null here.
      budgetLevel: status === 'WISH_LIST' ? budgetLevel : null,
      recommendedDishes: status === 'WISH_LIST' ? [] : recommendedDishes,
      notes: notes.trim(),
      tagIds,
      address: address.trim(),
    };

    onSubmit(formData);
  };

  const isWishList = status === 'WISH_LIST';

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed bottom-0 left-0 right-0 h-[100dvh] bg-white rounded-t-2xl overflow-y-auto md:static md:max-w-[512px] md:mx-auto md:mt-8 md:h-auto md:max-h-[90vh] md:rounded-2xl md:shadow-xl">
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10 md:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Form title */}
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? '新增餐廳' : '編輯餐廳'}
          </h2>

          {/* Google Places search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              搜尋餐廳 <span className="text-xs text-gray-400">(可選)</span>
            </label>
            <PlaceSearch onPlaceSelect={handlePlaceSelect} />
            <p className="mt-1 text-xs text-gray-400">搜尋後會自動填入名稱和評分，也可以直接手動輸入</p>
          </div>

          {/* Name field */}
          <div>
            <label htmlFor="restaurant-name" className="block text-sm font-medium text-gray-700 mb-1">
              餐廳名稱 <span className="text-red-500">*</span>
            </label>
            <input
              id="restaurant-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              maxLength={100}
              placeholder="輸入餐廳名稱"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Address field */}
          <div>
            <label htmlFor="restaurant-address" className="block text-sm font-medium text-gray-700 mb-1">
              地址
            </label>
            <input
              id="restaurant-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例：台北市大安區忠孝東路四段..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-400">從 Google Maps 搜尋會自動帶入，也可手動輸入</p>
          </div>

          {/* Status toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">造訪狀態</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('VISITED')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium min-h-[44px] transition-colors ${
                  status === 'VISITED'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                已造訪
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('WISH_LIST')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium min-h-[44px] transition-colors ${
                  status === 'WISH_LIST'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                想去清單
              </button>
            </div>
          </div>

          {/* Budget level selector - shown only when WISH_LIST */}
          {isWishList && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">預算等級</label>
              <div className="flex gap-2">
                {(['$', '$$', '$$$', '$$$$'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setBudgetLevel((prev) => (prev === level ? null : level))
                    }
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium min-h-[44px] transition-colors ${
                      budgetLevel === level
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-400">從 Google 帶入，也可手動調整</p>
            </div>
          )}

          {/* Rating - hidden when WISH_LIST */}
          {!isWishList && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">個人評分</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
          )}

          {/* Avg Cost - hidden when WISH_LIST */}
          {!isWishList && (
            <div>
              <label htmlFor="avg-cost" className="block text-sm font-medium text-gray-700 mb-1">
                平均每人消費
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  id="avg-cost"
                  type="number"
                  value={avgCost}
                  onChange={(e) => setAvgCost(e.target.value)}
                  onBlur={handleAvgCostBlur}
                  min={1}
                  max={99999}
                  placeholder="0"
                  className={`w-full border rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.avgCost ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.avgCost && (
                <p className="mt-1 text-sm text-red-600">{errors.avgCost}</p>
              )}
            </div>
          )}

          {/* Recommended Dishes - hidden when WISH_LIST */}
          {!isWishList && (
            <DishInput dishes={recommendedDishes} onChange={setRecommendedDishes} />
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
            <TagInput
              tags={tagIds}
              allTags={allTags}
              onChange={setTagIds}
              onAddNewTag={onAddNewTag}
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              個人筆記
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setNotes(e.target.value);
                }
              }}
              onBlur={handleNotesBlur}
              rows={3}
              placeholder="記錄你的用餐心得..."
              className={`w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.notes ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.notes ? (
                <p className="text-sm text-red-600">{errors.notes}</p>
              ) : (
                <span />
              )}
              <span className={`text-xs ${notes.length > 450 ? 'text-amber-600' : 'text-gray-400'}`}>
                {notes.length}/500
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 min-h-[44px] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 min-h-[44px] transition-colors"
            >
              {mode === 'create' ? '新增' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
