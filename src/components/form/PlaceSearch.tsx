import { useState, useRef, useEffect } from 'react';
import { searchPlaces, getPlaceDetails } from '../../utils/placesApi';
import type { PlacePrediction } from '../../utils/placesApi';

interface PlaceResult {
  name: string;
  address: string;
  rating: number | null;
  placeId: string;
  priceLevel: string | null;
}

interface PlaceSearchProps {
  onPlaceSelect: (place: PlaceResult) => void;
}

/**
 * Google Places 搜尋元件（使用 Places API New）
 * 讓使用者搜尋 Google Maps 上的餐廳，選擇後回傳餐廳資料
 */
export function PlaceSearch({ onPlaceSelect }: PlaceSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      const results = await searchPlaces(value);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setIsLoading(false);
    }, 300);
  };

  const handleSelectPlace = async (prediction: PlacePrediction) => {
    setIsLoading(true);
    const details = await getPlaceDetails(prediction.placeId);
    setIsLoading(false);

    if (details) {
      onPlaceSelect(details);
      setQuery(details.name);
    } else {
      // Fallback: use prediction data
      onPlaceSelect({
        name: prediction.mainText,
        address: prediction.secondaryText,
        rating: null,
        placeId: prediction.placeId,
        priceLevel: null,
      });
      setQuery(prediction.mainText);
    }

    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="搜尋 Google Maps 上的餐廳..."
          className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="搜尋餐廳"
          aria-expanded={isOpen}
          role="combobox"
          aria-autocomplete="list"
        />
        {isLoading && (
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((prediction) => (
            <li key={prediction.placeId}>
              <button
                type="button"
                onClick={() => handleSelectPlace(prediction)}
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors"
                role="option"
              >
                <p className="text-sm font-medium text-gray-800 truncate">
                  {prediction.mainText}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {prediction.secondaryText}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
