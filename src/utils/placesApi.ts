import type { BudgetLevel } from '../types';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/places-proxy`;

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
 * 格式：「台北市信義區」「桃園市桃園區」
 */
export function extractDistrict(addressComponents: AddressComponent[]): string | null {
  // 取得城市/縣（如：台北市、桃園市、新北市）
  const city = addressComponents.find((c) =>
    c.types.includes('administrative_area_level_1')
  );

  // 取得區（如：信義區、大安區、桃園區）
  // 優先用 administrative_area_level_2（台灣的區通常在這裡）
  // 其次用 sublocality_level_1（但排除名稱包含「里」的）
  const district = addressComponents.find((c) =>
    c.types.includes('administrative_area_level_2')
  ) || addressComponents.find((c) =>
    c.types.includes('sublocality_level_1') && !c.longText.endsWith('里')
  );

  if (city && district) {
    return `${city.longText}${district.longText}`;
  }
  if (district) {
    return district.longText;
  }
  if (city) {
    return city.longText;
  }

  return null;
}

const PRICE_LEVEL_MAP: Record<string, BudgetLevel> = {
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
};

/**
 * 將 Google Places 價位列舉字串對應為 BudgetLevel。
 * null、未知字串或未定義列舉一律回傳 null（null-safe）。
 */
export function priceLevelToBudgetLevel(priceLevel: string | null): BudgetLevel | null {
  if (priceLevel == null) return null;
  return PRICE_LEVEL_MAP[priceLevel] ?? null;
}

async function callPlacesProxy(action: string, params: Record<string, unknown>): Promise<unknown> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase 設定缺失，請確認環境變數');
  }

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action, params }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '未知錯誤' }));
    throw new Error(error.error || `API 錯誤 (${response.status})`);
  }

  return response.json();
}

/**
 * 根據 photo resource name 產生照片 URL（透過 proxy）
 */
export function getPhotoUrl(photoName: string, maxWidth: number = 400): string {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return '';
  return `${FUNCTION_URL}?action=photo&photoName=${encodeURIComponent(photoName)}&maxWidth=${maxWidth}&authorization=${encodeURIComponent(SUPABASE_ANON_KEY)}`;
}

/**
 * 使用 Places API (New) 的 Autocomplete 搜尋餐廳
 */
export async function searchPlaces(
  input: string,
  locationBias?: LocationBias
): Promise<PlacePrediction[]> {
  if (!SUPABASE_URL || input.trim().length < 2) return [];

  try {
    const params: Record<string, unknown> = { input };
    if (locationBias) {
      params.locationBias = locationBias;
    }

    const data = await callPlacesProxy('autocomplete', params) as { suggestions?: any[] };

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
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!SUPABASE_URL) return null;

  try {
    const data = await callPlacesProxy('details', { placeId }) as Record<string, any>;

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
