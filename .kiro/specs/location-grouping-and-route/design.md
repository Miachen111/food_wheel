# 設計文件：地區分組與路線排序

## 架構概述

本功能為現有美食輪盤應用新增兩項互相關聯的能力：

1. **地區分組** — 擴充 Google Places API 資料擷取，從 `addressComponents` 中萃取行政區，並新增「依地區分組」的分組模式。
2. **路線排序** — 讓使用者針對已勾選的餐廳，以最近鄰演算法計算最佳路線順序，並生成 Google Maps 導航連結。

兩者共用的基礎是為 `Restaurant` 新增 `latitude`、`longitude`、`district` 三個 nullable 欄位。

```
┌──────────────────────────────────────────────────┐
│                   PlacesAPI                       │
│  getPlaceDetails (+ location, addressComponents) │
└────────────────────┬─────────────────────────────┘
                     │ 回傳 PlaceDetails (含 lat/lng/district)
                     ▼
┌──────────────────────────────────────────────────┐
│              Restaurant Model                     │
│  + latitude, longitude, district (nullable)       │
└────────┬───────────────────────────────┬─────────┘
         │                               │
         ▼                               ▼
┌─────────────────┐          ┌──────────────────────┐
│  groupByDistrict │          │   routeUtils.ts       │
│  (groupUtils.ts) │          │  - haversine()        │
└─────────────────┘          │  - nearestNeighbor()  │
                             │  - buildMapsUrl()     │
                             └──────────┬───────────┘
                                        │
                                        ▼
                             ┌──────────────────────┐
                             │   RoutePage.tsx        │
                             │  (路線規劃頁面)         │
                             └──────────────────────┘
```

---

## 資料模型變更

### Restaurant 介面擴充

```typescript
export interface Restaurant {
  // ... 既有欄位 ...
  latitude: number | null;    // 緯度，從 Places API location 取得
  longitude: number | null;   // 經度，從 Places API location 取得
  district: string | null;    // 行政區名稱，例如「大安區」「信義區」
}
```

### PlaceDetails 介面擴充

```typescript
export interface PlaceDetails {
  // ... 既有欄位 ...
  latitude: number | null;
  longitude: number | null;
  district: string | null;    // 從 addressComponents 萃取
}
```

### GroupMode 擴充

```typescript
export type GroupMode = 'status' | 'budget' | 'tag' | 'district';
```

### AppState 導航頁面擴充

```typescript
currentPage: 'list' | 'roulette' | 'calories' | 'chat' | 'route';
```

---

## 元件與介面設計

### 1. Places API 資料擷取修改 (`placesApi.ts`)

**FieldMask 擴充：**
```
displayName,formattedAddress,rating,id,photos,priceLevel,currentOpeningHours,userRatingCount,googleMapsUri,types,location,addressComponents
```

**行政區萃取邏輯：**
```typescript
function extractDistrict(addressComponents: AddressComponent[]): string | null {
  // 優先找 sublocality_level_1（如台北市的「大安區」）
  // 備選 administrative_area_level_3
  // 都找不到回傳 null
}
```

`AddressComponent` 結構：
```typescript
interface AddressComponent {
  longText: string;
  shortText: string;
  types: string[];
  languageCode: string;
}
```

### 2. 地區分組函式 (`groupUtils.ts`)

```typescript
export function groupByDistrict(restaurants: Restaurant[]): RestaurantGroup[] {
  // 以 restaurant.district 分組
  // district 為 null 的歸入 key='unknown', label='未知地區'
  // 按照 district 名稱字母排序（未知地區放最後）
}
```

在 `groupRestaurants` switch 中加入 `case 'district'` 分支。

### 3. 路線工具函式 (`src/utils/routeUtils.ts` — 新檔案)

```typescript
/** 計算兩點間的 Haversine 距離（公尺） */
export function haversine(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number;

/** 座標點介面 */
export interface Waypoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

/** 最近鄰演算法排序 */
export function nearestNeighborSort(
  waypoints: Waypoint[],
  startLat: number,
  startLng: number
): Waypoint[];

/** 產生 Google Maps 導航 URL */
export function buildGoogleMapsUrl(
  sortedWaypoints: Waypoint[],
  startLat?: number,
  startLng?: number
): string;
```

### 4. 路線規劃頁面 (`src/components/route/RoutePage.tsx`)

- 從 `AppState.selectedRestaurantIds` 取得已選餐廳
- 過濾出有有效座標的餐廳
- 提供「起點選擇」：目前位置（使用 `useGeolocation`）或第一間餐廳
- 執行 `nearestNeighborSort` 並顯示排序結果
- 顯示各站間直線距離
- 「在 Google Maps 開啟」按鈕 → `window.open(url, '_blank')`
- 若有效餐廳少於 2 間，顯示提示訊息

---

## 演算法設計

### Haversine 公式

```typescript
export function haversine(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // 地球半徑（公尺）
  const toRad = (deg: number) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### 最近鄰演算法

```typescript
export function nearestNeighborSort(
  waypoints: Waypoint[],
  startLat: number,
  startLng: number
): Waypoint[] {
  const result: Waypoint[] = [];
  const remaining = [...waypoints];
  let currentLat = startLat;
  let currentLng = startLng;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const dist = haversine(currentLat, currentLng, remaining[i].latitude, remaining[i].longitude);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    const next = remaining.splice(nearestIdx, 1)[0];
    result.push(next);
    currentLat = next.latitude;
    currentLng = next.longitude;
  }

  return result;
}
```

### Google Maps URL 產生

格式：`https://www.google.com/maps/dir/起點lat,起點lng/lat1,lng1/lat2,lng2/...`

```typescript
export function buildGoogleMapsUrl(
  sortedWaypoints: Waypoint[],
  startLat?: number,
  startLng?: number
): string {
  const segments: string[] = [];
  if (startLat !== undefined && startLng !== undefined) {
    segments.push(`${startLat},${startLng}`);
  }
  for (const wp of sortedWaypoints) {
    segments.push(`${wp.latitude},${wp.longitude}`);
  }
  return `https://www.google.com/maps/dir/${segments.join('/')}`;
}
```

---

## 錯誤處理

| 情境 | 處理方式 |
|------|----------|
| Places API 回傳無 location | `latitude`/`longitude` 設為 null |
| Places API 回傳無 addressComponents | `district` 設為 null |
| 定位功能不可用 | 路線規劃頁面僅能選「第一間餐廳」為起點 |
| 已選餐廳中無有效座標 | 顯示提示「所選餐廳缺少座標資料，無法規劃路線」 |
| 已選餐廳少於 2 間 | 顯示提示「請至少選擇 2 間餐廳」 |

---

## 資料遷移

既有 localStorage 中的餐廳資料不含 `latitude`、`longitude`、`district` 欄位。載入時：
- 缺少欄位自動視為 `null`（TypeScript 存取不存在的屬性得到 `undefined`，程式碼中以 `?? null` 正規化）
- 在 `LOAD_DATA` reducer 中加入正規化邏輯

---

## Correctness Properties

*Property 是系統在所有合法輸入下都應保持的行為特徵，作為人類可讀規格與自動化測試之間的橋樑。*

### Property 1: 地區分組保留所有餐廳

*For any* 餐廳陣列，`groupByDistrict` 產生的所有分組中餐廳總數應等於輸入陣列長度（不遺失、不重複）。

**Validates: Requirements 2.1, 2.2**

### Property 2: 地區分組內容一致性

*For any* 餐廳陣列，`groupByDistrict` 產生的每個分組中，所有餐廳的 `district` 值都與該分組的 `key` 一致（null district 對應 'unknown' key）。

**Validates: Requirements 2.1, 1.3**

### Property 3: Haversine 距離對稱性與非負性

*For any* 兩組合法經緯度座標 (lat1, lng1) 與 (lat2, lng2)：
- `haversine(lat1, lng1, lat2, lng2) === haversine(lat2, lng2, lat1, lng1)`（對稱）
- `haversine(lat1, lng1, lat2, lng2) >= 0`（非負）
- `haversine(lat1, lng1, lat1, lng1) === 0`（同點距離為零）

**Validates: Requirements 3.2**

### Property 4: 最近鄰演算法保留所有點

*For any* waypoint 陣列與起始座標，`nearestNeighborSort` 回傳的陣列包含且僅包含原始輸入中的所有 waypoint（是原陣列的排列組合）。

**Validates: Requirements 3.1**

### Property 5: 最近鄰演算法貪心選擇正確性

*For any* waypoint 陣列與起始座標，`nearestNeighborSort` 回傳路線中每一步所選的下一個點，都是當時所有未拜訪點中離當前位置最近的。

**Validates: Requirements 3.1, 3.5**

### Property 6: Google Maps URL 包含所有 waypoint 且順序正確

*For any* 排序後的 waypoint 陣列，`buildGoogleMapsUrl` 產生的 URL 中，各 waypoint 的座標按照輸入順序出現在 URL 路徑中。

**Validates: Requirements 3.3**

### Property 7: 行政區萃取邏輯正確性

*For any* addressComponents 陣列中含有 `sublocality_level_1` 或 `administrative_area_level_3` 類型的元件，`extractDistrict` 回傳該元件的 `longText`；若兩者都有，優先回傳 `sublocality_level_1`。

**Validates: Requirements 1.2**
