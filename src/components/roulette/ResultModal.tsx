import { useEffect, useRef, type MouseEvent } from 'react';
import { Restaurant, Tag } from '../../types';
import { TagList } from '../shared/TagList';

export interface ResultModalProps {
  restaurant: Restaurant;
  tags: Tag[];
  onClose: () => void;
  onSpinAgain: () => void;
}

export const ResultModal = ({
  restaurant,
  tags,
  onClose,
  onSpinAgain,
}: ResultModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll on mount, restore on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Close on overlay click (click outside panel)
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const isVisited = restaurant.status === 'VISITED';

  // Resolve tags for this restaurant
  const restaurantTags = tags.filter((tag) =>
    restaurant.tagIds.includes(tag.id)
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="結果彈窗"
    >
      <div
        ref={panelRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto md:static md:max-w-[560px] md:mx-auto md:mt-[10vh] md:rounded-2xl md:max-h-none"
      >
        <div className="flex justify-center pt-3 pb-2 md:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
        <div className="p-6 pb-24 md:pb-6 flex flex-col gap-4">
          {/* Restaurant Name */}
          <h2 className="text-2xl font-bold text-gray-900">
            {restaurant.name}
          </h2>

          {/* Status Badge */}
          <div>
            {restaurant.status === 'WISH_LIST' ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                想去
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                去過
              </span>
            )}
          </div>

          {/* VISITED-only fields: rating, avg cost, recommended dishes */}
          {isVisited && (
            <>
              {/* Rating */}
              {restaurant.rating !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">評分</span>
                  <span className="text-amber-500 font-medium">
                    ★ {restaurant.rating}
                  </span>
                </div>
              )}

              {/* Average Cost */}
              {restaurant.avgCost !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">平均消費</span>
                  <span className="font-medium text-gray-900">
                    ${restaurant.avgCost}
                  </span>
                </div>
              )}

              {/* Recommended Dishes */}
              {restaurant.recommendedDishes.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-600">推薦菜色</span>
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
            </>
          )}

          {/* Tags */}
          {restaurantTags.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">標籤</span>
              <TagList tags={restaurantTags} />
            </div>
          )}

          {/* Notes */}
          {restaurant.notes && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">筆記</span>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {restaurant.notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              關閉
            </button>
            <button
              type="button"
              onClick={onSpinAgain}
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              再轉一次
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
