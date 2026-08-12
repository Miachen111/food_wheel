const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  name: string;
  address: string;
  rating: number | null;
  placeId: string;
}

/**
 * 使用 Places API (New) 的 Autocomplete 搜尋餐廳
 * https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
 */
export async function searchPlaces(input: string): Promise<PlacePrediction[]> {
  if (!API_KEY || input.trim().length < 2) return [];

  try {
    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
        },
        body: JSON.stringify({
          input,
          includedPrimaryTypes: ['restaurant', 'food', 'cafe', 'meal_takeaway', 'meal_delivery'],
          languageCode: 'zh-TW',
        }),
      }
    );

    if (!response.ok) {
      console.warn('[placesApi] Autocomplete error:', response.status, await response.text());
      return [];
    }

    const data = await response.json();

    if (!data.suggestions) return [];

    return data.suggestions
      .filter((s: any) => s.placePrediction)
      .map((s: any) => ({
        placeId: s.placePrediction.placeId,
        mainText: s.placePrediction.structuredFormat?.mainText?.text || s.placePrediction.text?.text || '',
        secondaryText: s.placePrediction.structuredFormat?.secondaryText?.text || '',
      }));
  } catch (error) {
    console.warn('[placesApi] Autocomplete fetch error:', error);
    return [];
  }
}

/**
 * 使用 Places API (New) 取得地點詳細資料
 * https://developers.google.com/maps/documentation/places/web-service/place-details
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!API_KEY) return null;

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'displayName,formattedAddress,rating,id',
        },
      }
    );

    if (!response.ok) {
      console.warn('[placesApi] Details error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();

    return {
      name: data.displayName?.text || '',
      address: data.formattedAddress || '',
      rating: data.rating ?? null,
      placeId: data.id || placeId,
    };
  } catch (error) {
    console.warn('[placesApi] Details fetch error:', error);
    return null;
  }
}
