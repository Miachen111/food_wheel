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
    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
      {showDishes && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">推薦菜色</h4>
          <div className="flex flex-wrap gap-1">
            {restaurant.recommendedDishes.map((dish, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              >
                {dish}
              </span>
            ))}
          </div>
        </div>
      )}

      {showNotes && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">個人筆記</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {restaurant.notes}
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onEdit}
          className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
          aria-label="編輯餐廳"
        >
          編輯
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 focus:ring-red-500"
          aria-label="刪除餐廳"
        >
          刪除
        </button>
      </div>
    </div>
  );
};
