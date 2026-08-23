import { useState, useRef } from 'react';
import { searchPlaces, getPlaceDetails, getPhotoUrl } from '../../utils/placesApi';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useAppContext } from '../../context/AppContext';
import type { PlacePrediction, PlaceDetails } from '../../utils/placesApi';

interface ExploreOverlayProps {
  onClose: () => void;
}

/** 價格等級對照 */
function formatPriceLevel(priceLevel: string | null): string {
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE':
      return '免費';
    case 'PRICE_LEVEL_INEXPENSIVE':
      return '$';
    case 'PRICE_LEVEL_MODERATE':
      return '$$';
    case 'PRICE_LEVEL_EXPENSIVE':
      return '$$$';
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return '$$$$';
    default:
      return '';
  }
}

/**
 * 探索附近餐廳的全螢幕覆蓋層
 * 使用 Google Places API 搜尋，並可將結果加入想去清單
 */
export function ExploreOverlay({ onClose }: ExploreOverlayProps) {
  const { dispatch } = useAppContext();
  const { latitude, longitude } = useGeolocation();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [addedPlaceIds, setAddedPlaceIds] = useState<Set<string>>(new Set());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      const locationBias =
        latitude && longitude ? { latitude, longitude } : undefined;
      const results = await searchPlaces(value, locationBias);
      setSuggestions(results);
      setIsSearching(false);
    }, 300);
  };

  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    setIsLoadingDetails(true);
    setSuggestions([]);
    setQuery(prediction.mainText);

    const details = await getPlaceDetails(prediction.placeId);
    setSelectedPlace(details);
    setIsLoadingDetails(false);
  };

  const handleAddToWishList = () => {
    if (!selectedPlace) return;

    dispatch({
      type: 'ADD_RESTAURANT',
      payload: {
        name: selectedPlace.name,
        status: 'WISH_LIST',
        rating: null,
        avgCost: null,
        recommendedDishes: [],
        notes: '',
        tagIds: [],
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        district: selectedPlace.district,
        address: selectedPlace.address || '',
      },
    });

    setAddedPlaceIds((prev) => new Set(prev).add(selectedPlace.placeId));
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedPlace(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/0 md:bg-black/50">
    <div className="w-full h-full md:max-w-3xl md:h-[90vh] md:rounded-2xl md:shadow-2xl bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
          aria-label="關閉探索"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">探索餐廳</h1>
      </header>

      {/* Search bar */}
      <div className="px-4 py-3 shrink-0">
        <div className="relative">
          {/* Map pin icon */}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="搜尋 Google Maps 上的餐廳..."
            className="w-full border border-gray-300 rounded-md pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="搜尋餐廳"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[28px] min-h-[28px] inline-flex items-center justify-center rounded-full hover:bg-gray-100"
              aria-label="清除搜尋"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-gray-400"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {isSearching && (
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Suggestions list */}
        {suggestions.length > 0 && !selectedPlace && (
          <ul className="divide-y divide-gray-100">
            {suggestions.map((prediction) => (
              <li key={prediction.placeId}>
                <button
                  type="button"
                  onClick={() => handleSelectPrediction(prediction)}
                  className="w-full text-left px-3 py-3 hover:bg-indigo-50 rounded-md transition-colors min-h-[44px]"
                >
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {prediction.mainText}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {prediction.secondaryText}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Loading details */}
        {isLoadingDetails && (
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-6 w-6 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="ml-2 text-sm text-gray-500">載入中...</span>
          </div>
        )}

        {/* Place detail card */}
        {selectedPlace && !isLoadingDetails && (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Photo */}
            {selectedPlace.photos.length > 0 && selectedPlace.photos[0] && (
              <img
                src={getPhotoUrl(selectedPlace.photos[0].name, 600)}
                alt={selectedPlace.name}
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-4 space-y-3">
              {/* Name */}
              <h2 className="text-lg font-bold text-gray-900">
                {selectedPlace.name}
              </h2>

              {/* Address */}
              {selectedPlace.address && (
                <p className="text-sm text-gray-600">{selectedPlace.address}</p>
              )}

              {/* Rating + reviews */}
              <div className="flex items-center gap-3 flex-wrap">
                {selectedPlace.rating !== null && (
                  <span className="inline-flex items-center gap-1 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 text-yellow-400"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{selectedPlace.rating}</span>
                    {selectedPlace.userRatingCount !== null && (
                      <span className="text-gray-500">
                        ({selectedPlace.userRatingCount} 則評論)
                      </span>
                    )}
                  </span>
                )}

                {/* Price level */}
                {formatPriceLevel(selectedPlace.priceLevel) && (
                  <span className="text-sm text-gray-600">
                    {formatPriceLevel(selectedPlace.priceLevel)}
                  </span>
                )}

                {/* Open now */}
                {selectedPlace.currentOpeningHours !== null && (
                  <span
                    className={`text-sm font-medium ${
                      selectedPlace.currentOpeningHours.openNow
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}
                  >
                    {selectedPlace.currentOpeningHours.openNow
                      ? '營業中'
                      : '已打烊'}
                  </span>
                )}
              </div>

              {/* Types */}
              {selectedPlace.types.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedPlace.types.slice(0, 5).map((type) => (
                    <span
                      key={type}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToWishList}
                  disabled={addedPlaceIds.has(selectedPlace.placeId)}
                  className="min-h-[44px] flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {addedPlaceIds.has(selectedPlace.placeId)
                    ? '已加入清單'
                    : '加入想去清單'}
                </button>

                {selectedPlace.googleMapsUri && (
                  <a
                    href={selectedPlace.googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center px-3 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mr-1"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    地圖
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedPlace && suggestions.length === 0 && !isSearching && !isLoadingDetails && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-12 h-12 text-gray-300 mb-3"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="text-sm text-gray-500">
              搜尋附近的餐廳，探索新口味
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
