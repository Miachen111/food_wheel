import React from 'react';
import { Restaurant, Tag } from '../../types';
import { TagList } from '../shared/TagList';

interface RestaurantCardProps {
  restaurant: Restaurant;
  tags: Tag[];
  isExpanded: boolean;
  onToggle: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  tags,
  isExpanded,
  onToggle,
}) => {
  const resolvedTags = tags.filter((tag) => restaurant.tagIds.includes(tag.id));

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition cursor-pointer"
      onClick={onToggle}
      role="article"
      aria-expanded={isExpanded}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{restaurant.name}</h3>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            restaurant.status === 'WISH_LIST'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          }`}
        >
          {restaurant.status === 'WISH_LIST' ? '想去' : '已造訪'}
        </span>
      </div>

      {restaurant.address && (
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">{restaurant.address}</p>
      )}

      {restaurant.status === 'WISH_LIST' && restaurant.budgetLevel !== null && (
        <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{restaurant.budgetLevel}</span>
        </div>
      )}

      {restaurant.status === 'VISITED' && (
        <div className="flex items-center gap-3 mb-2 text-sm text-gray-600 dark:text-gray-400">
          {restaurant.rating !== null && (
            <span className="flex items-center gap-0.5">
              <span className="text-yellow-500">★</span> {restaurant.rating}
            </span>
          )}
          {restaurant.avgCost !== null && <span>NT${restaurant.avgCost}</span>}
        </div>
      )}

      {resolvedTags.length > 0 && (
        <div className="mt-2">
          <TagList tags={resolvedTags} maxVisible={5} />
        </div>
      )}

    </div>
  );
};
