const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export interface PlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
}

export interface PlaceOpeningHours {
  openNow: boolean;
  weekdayDescriptions: string[];
}

export interface PlaceDetails {
  name: string;
  address: string;
  rating: number | null;
  placeId: string;
  photos: PlacePhoto[];
  priceLevel: string | null;
  currentOpeningHours: PlaceOpeningHours | null;
  userRatingCount: number | null;
  googleMapsUri: string | null;
  types: string[];
  latitude: number | null;
  longitude: number | null;
  district: string | null;
}

export interface AddressComponent {
  longText: string;
  shortText: string;
  types: string[];
  languageCode: string;
}

export interface LocationBias {
  latitude: number;
  longitude: number;
}

/**
 * 從 addressComponents 中萃取行政區名稱
 * 優先取 sublocality_level_1（如台北市的「大安區」）
 * 備選 administrative_area_level_3
 * 都找不到回傳 null
 */
export function extractDistrict(addressComponents: AddressComponent[]): string | null {
  const sublocalityLevel1 = addressComponents.find((c) =>
    c.types.includes('sublocality_level_1')
  );
  if (sublocalityLevel1) return sublocalityLevel1.longText;

  const adminLevel3 = addressComponents.find((c) =>
    c.types.includes('administrative_area_level_3')
  );
  if (adminLevel3) return adminLevel3.longText;

  return null;
}

/**
 * 根據 photo resource name 產生照片 URL
 */
export function getPhotoUrl(photoName: string, maxWidth: number = 400): string {
  if (!API_KEY) return '';
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}

/**
 * 使用 Places API (New) 的 Autocomplete 搜尋餐廳
 * https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
 */
export async function searchPlaces(
  input: string,
  locationBias?: LocationBias
): Promise<PlacePrediction[]> {
  if (!API_KEY || input.trim().length < 2) return [];

  try {
    const body: Record<string, unknown> = {
      input,
      includedPrimaryTypes: ['restaurant', 'food', 'cafe', 'meal_takeaway', 'meal_delivery'],
      languageCode: 'zh-TW',
    };

    if (locationBias) {
      body.locationBias = {
        circle: {
          center: {
            latitude: locationBias.latitude,
            longitude: locationBias.longitude,
          },
          radius: 5000.0,
        },
      };
    }

    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
        },
        body: JSON.stringify(body),
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
 * 使用 Places API (New) 取得地點詳細資料（含照片、價格、營業時間等）
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
          'X-Goog-FieldMask':
            'displayName,formattedAddress,rating,id,photos,priceLevel,currentOpeningHours,userRatingCount,googleMapsUri,types,location,addressComponents',
        },
      }
    );

    if (!response.ok) {
      console.warn('[placesApi] Details error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();

    const photos: PlacePhoto[] = (data.photos || []).map((p: any) => ({
      name: p.name || '',
      widthPx: p.widthPx || 0,
      heightPx: p.heightPx || 0,
    }));

    return {
      name: data.displayName?.text || '',
      address: data.formattedAddress || '',
      rating: data.rating ?? null,
      placeId: data.id || placeId,
      photos,
      priceLevel: data.priceLevel ?? null,
      currentOpeningHours: data.currentOpeningHours
        ? {
            openNow: data.currentOpeningHours.openNow ?? false,
            weekdayDescriptions: data.currentOpeningHours.weekdayDescriptions || [],
          }
        : null,
      userRatingCount: data.userRatingCount ?? null,
      googleMapsUri: data.googleMapsUri ?? null,
      types: data.types || [],
      latitude: data.location?.latitude ?? null,
      longitude: data.location?.longitude ?? null,
      district: extractDistrict(data.addressComponents || []),
    };
  } catch (error) {
    console.warn('[placesApi] Details fetch error:', error);
    return null;
  }
}
