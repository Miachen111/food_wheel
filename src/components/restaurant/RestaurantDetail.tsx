import React from 'react';
import { Restaurant } from '../../types';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onEdit: () => void;
  onDelete: () => void;
}

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({
  restaurant,
  onEdit,
  onDelete,
}) => {
  const showDishes =
    restaurant.status !== 'WISH_LIST' && restaurant.recommendedDishes.length > 0;
  const showNotes = restaurant.notes.length > 0;

  return (
    <div className="border-t pt-3 mt-3">
      {showDishes && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">推薦菜色</h4>
          <div className="flex flex-wrap gap-1">
            {restaurant.recommendedDishes.map((dish, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
              >
                {dish}
              </span>
            ))}
          </div>
        </div>
      )}

      {showNotes && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">個人筆記</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {restaurant.notes}
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onEdit}
          className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
          aria-label="編輯餐廳"
        >
          編輯
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
          aria-label="刪除餐廳"
        >
          刪除
        </button>
      </div>
    </div>
  );
};
