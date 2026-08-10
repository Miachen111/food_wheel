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
      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition cursor-pointer"
      onClick={onToggle}
      role="article"
      aria-expanded={isExpanded}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 truncate">{restaurant.name}</h3>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            restaurant.status === 'WISH_LIST'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {restaurant.status === 'WISH_LIST' ? '想去' : '已造訪'}
        </span>
      </div>

      {restaurant.status === 'VISITED' && (
        <div className="flex items-center gap-3 mb-2 text-sm text-gray-600">
          {restaurant.rating !== null && (
            <span className="flex items-center gap-0.5">
              <span className="text-yellow-500">★</span> {restaurant.rating}
            </span>
          )}
          {restaurant.avgCost !== null && <span>${restaurant.avgCost}</span>}
        </div>
      )}

      {resolvedTags.length > 0 && (
        <div className="mt-2">
          <TagList tags={resolvedTags} maxVisible={5} />
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-700">
          {restaurant.recommendedDishes.length > 0 && (
            <p className="mb-1">
              <span className="font-medium">推薦菜色：</span>
              {restaurant.recommendedDishes.join('、')}
            </p>
          )}
          {restaurant.notes && (
            <p>
              <span className="font-medium">筆記：</span>
              {restaurant.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
