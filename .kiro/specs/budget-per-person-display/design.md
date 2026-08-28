# 設計文件

## 概觀 (Overview)

本功能為「想去清單 (WISH_LIST)」餐廳補上每人平均消費的呈現，使其與「已造訪 (VISITED)」餐廳一致地在餐廳卡片顯示預算資訊。核心設計決策如下：

- **預算等級由三級擴充為四級**：`BudgetLevel` 與 `BudgetFilter` 由 `$`/`$$`/`$$$` 擴充為 `$`/`$$`/`$$$`/`$$$$`，以完整對應 Google Places 的四級價位。
- **雙來源、雙呈現**：
  - WISH_LIST 的預算來自 Google Places 的 `priceLevel`（列舉字串），對應為 `$` 符號等級，並允許使用者手動覆寫。
  - VISITED 的預算維持既有的使用者手動輸入台幣金額 (`avgCost`)。
- **最小侵入**：沿用現有的資料流（`PlaceSearch` → `ReviewForm` → `RestaurantFormData` → reducer → `dataService`）與命名慣例（app 使用 camelCase，DB 使用 snake_case），只在必要處新增欄位與對應邏輯。

專案技術：TypeScript + React + Vite + Supabase(Postgres)。以下程式碼範例皆使用 TypeScript / TSX。

## 架構 (Architecture)

資料流（本功能相關路徑）：

```
Google Places API
      │  priceLevel: string | null (PRICE_LEVEL_*)
      ▼
placesApi.getPlaceDetails ──► PlaceDetails.priceLevel
      │
      ▼
PlaceSearch.onPlaceSelect(place)   // 回呼中帶出 priceLevel
      │
      ▼
ReviewForm.handlePlaceSelect
      │  priceLevelToBudgetLevel(priceLevel) → BudgetLevel | null
      ▼
ReviewForm 狀態 budgetLevel  ◄──► 使用者手動選擇 (WISH_LIST 選擇器)
      │  (VISITED 則走 avgCost 數值輸入)
      ▼
RestaurantFormData { budgetLevel, avgCost, ... }
      │
      ▼
appReducer (ADD/UPDATE_RESTAURANT) → Restaurant.budgetLevel
      │
      ├──► dataService.restaurantToDb → budget_level (DB)
      │
      └──► RestaurantCard 顯示：WISH_LIST=$符號 / VISITED=NT$金額
```

分組與篩選：`filterUtils.filterCandidates` 與 `groupUtils.groupByBudget` 各自新增第四級 `$$$$` 的處理，`FilterPanel` 的預算選項新增 `$$$$`。

## 元件與介面 (Components and Interfaces)

### 1. 型別變更 (`src/types/index.ts`)

擴充預算等級為四級，並於表單資料補上 `budgetLevel` 欄位。

```typescript
// 由三級擴充為四級
export type BudgetLevel = '$' | '$$' | '$$$' | '$$$$';

// 篩選器同步擴充
export type BudgetFilter = 'ALL' | '$' | '$$' | '$$$' | '$$$$';

export interface RestaurantFormData {
  name: string;
  status: RestaurantStatus;
  rating: number | null;
  avgCost: number | null;
  budgetLevel?: BudgetLevel | null; // 新增：承載 WISH_LIST 的預算等級
  recommendedDishes: string[];
  notes: string;
  tagIds: string[];
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  district?: string | null;
}
```

`Restaurant.budgetLevel` 已存在（型別為 `BudgetLevel | null`），擴充 `BudgetLevel` 後自動涵蓋第四級，無需額外變更該欄位定義。

### 2. price_level → BudgetLevel 對應函式

**放置位置決策**：放在 `src/utils/placesApi.ts`。理由：`priceLevel` 是 Places API 專屬的列舉字串（`PlaceDetails.priceLevel`），此對應在語意上屬於「Places 領域資料 → 應用領域型別」的轉換，與 `extractDistrict` 等既有 Places 專屬轉換函式為同一類職責，置於 `placesApi.ts` 內聚性最高。`formatUtils.ts` 則維持「呈現層格式化」職責（如 `deriveBudgetLevel`、`formatCurrency`），不引入 Places 列舉知識。

```typescript
// src/utils/placesApi.ts

import type { BudgetLevel } from '../types';

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
```

### 3. `PlaceSearch` 串接 priceLevel (`src/components/form/PlaceSearch.tsx`)

`PlaceResult` 介面補上 `priceLevel`，並在兩處呼叫 `onPlaceSelect` 時帶出：

- `details` 存在時：`getPlaceDetails` 回傳的 `PlaceDetails` 已含 `priceLevel`，直接傳遞（`onPlaceSelect(details)` 已符合，只需擴充回呼型別）。
- fallback（無 details）時：`priceLevel` 設為 `null`。

```typescript
interface PlaceResult {
  name: string;
  address: string;
  rating: number | null;
  placeId: string;
  priceLevel: string | null; // 新增
}

// fallback 分支補上 priceLevel: null
onPlaceSelect({
  name: prediction.mainText,
  address: prediction.secondaryText,
  rating: null,
  placeId: prediction.placeId,
  priceLevel: null,
});
```

`PlaceDetails` 已包含 `priceLevel`（見 `placesApi.ts`），故 `onPlaceSelect(details)` 分支無需額外組裝，僅需 `PlaceResult` 型別涵蓋此欄位。

### 4. `ReviewForm` 表單邏輯 (`src/components/form/ReviewForm.tsx`)

**新增狀態**：`budgetLevel`（型別 `BudgetLevel | null`），以 `initialData?.budgetLevel ?? null` 初始化。

```typescript
const [budgetLevel, setBudgetLevel] = useState<BudgetLevel | null>(
  initialData?.budgetLevel ?? null
);
```

**地點選取自動帶入**（Requirement 3.2、4.2）：`handlePlaceSelect` 接收擴充後的 `place`，將 `priceLevel` 對應並寫入 `budgetLevel`。僅在對應結果非 `null` 時覆寫，避免無價位資料的地點清掉使用者既有選擇。

```typescript
const handlePlaceSelect = (place: {
  name: string; address: string; rating: number | null; placeId: string; priceLevel: string | null;
}) => {
  setName(place.name);
  setAddress(place.address);
  if (place.rating !== null) {
    setRating(Math.round(place.rating * 2) / 2);
  }
  const mapped = priceLevelToBudgetLevel(place.priceLevel);
  if (mapped !== null) {
    setBudgetLevel(mapped); // 自動帶入；使用者仍可於選擇器手動覆寫
  }
  setErrors((prev) => ({ ...prev, name: undefined }));
};
```

**狀態切換清理**：`handleStatusChange` 切到 `WISH_LIST` 時清 `rating`/`avgCost`/`recommendedDishes`（既有行為）；切到 `VISITED` 時可選擇保留或清除 `budgetLevel`。設計採「切到 VISITED 時將 `budgetLevel` 設為 `null`」以維持兩種狀態預算來源互斥的一致性（VISITED 用 `avgCost`）。

**UI（WISH_LIST 顯示四級選擇器）**（Requirement 4.1、4.3）：在 `isWishList` 為 true 時渲染四個按鈕（`$`/`$$`/`$$$`/`$$$$`），可點選切換；再次點選同一等級可取消為 `null`（對應 4.4 未選擇的 `null` 情境）。VISITED 維持既有 `avgCost` 數值輸入。

```tsx
{isWishList ? (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">預算等級</label>
    <div className="flex gap-2">
      {(['$', '$$', '$$$', '$$$$'] as const).map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => setBudgetLevel((prev) => (prev === level ? null : level))}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium min-h-[44px] transition-colors ${
            budgetLevel === level
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {level}
        </button>
      ))}
    </div>
    <p className="mt-1 text-xs text-gray-400">從 Google 帶入，也可手動調整</p>
  </div>
) : (
  /* 既有的 avgCost 數值輸入區塊（NT$） */
)}
```

**提交組裝**（Requirement 4.4、5.x）：

```typescript
const formData: RestaurantFormData = {
  name: name.trim(),
  status,
  rating: status === 'WISH_LIST' ? null : rating,
  avgCost: status === 'WISH_LIST' ? null : parsedCost,
  budgetLevel: status === 'WISH_LIST' ? budgetLevel : deriveBudgetLevel(parsedCost),
  recommendedDishes: status === 'WISH_LIST' ? [] : recommendedDishes,
  notes: notes.trim(),
  tagIds,
  address: address.trim(),
};
```

VISITED 的 `budgetLevel` 由既有 `deriveBudgetLevel(avgCost)` 衍生，維持分組/篩選在 VISITED 餐廳上仍可運作；WISH_LIST 則採使用者/自動帶入的等級。`avgCost` 的 1–99999 驗證沿用既有 `validateAvgCost`（Requirement 5.2、5.3），不變更。

### 5. `RestaurantCard` 顯示邏輯 (`src/components/restaurant/RestaurantCard.tsx`)

依狀態決定預算呈現（Requirement 6.1–6.3）：

- `WISH_LIST` 且 `budgetLevel !== null`：顯示 `$` 符號等級。
- `VISITED` 且 `avgCost !== null`：顯示 `NT$` 金額（沿用/擴充 `formatCurrency`）。
- 對應預算值為 `null`：不渲染預算區塊。

```tsx
{restaurant.status === 'WISH_LIST' && restaurant.budgetLevel !== null && (
  <span className="text-sm text-gray-600">{restaurant.budgetLevel}</span>
)}

{restaurant.status === 'VISITED' && restaurant.avgCost !== null && (
  <span className="text-sm text-gray-600">NT${restaurant.avgCost}</span>
)}
```

WISH_LIST 卡片目前只渲染名稱、地址、標籤；需在地址下方新增預算列。VISITED 既有 `${restaurant.avgCost}` 顯示維持（可統一為 `NT$` 前綴以符合需求語意）。

### 6. 篩選與分組更新

**`filterUtils.ts`**：`filterCandidates` 以 `r.budgetLevel !== filters.budget` 比對，型別擴充後自動支援 `$$$$`，邏輯無需變更（僅受惠於型別擴充）。

**`FilterPanel.tsx`**：`BUDGET_OPTIONS` 新增第四級。

```typescript
const BUDGET_OPTIONS: { value: BudgetFilter; label: string }[] = [
  { value: 'ALL', label: '不限' },
  { value: '$', label: '$' },
  { value: '$$', label: '$$' },
  { value: '$$$', label: '$$$' },
  { value: '$$$$', label: '$$$$' }, // 新增
];
```

**`groupUtils.ts`**：`groupByBudget` 的 `buckets` 與 `labels` 新增 `$$$$`。

```typescript
export function groupByBudget(restaurants: Restaurant[]): RestaurantGroup[] {
  const buckets: Record<string, Restaurant[]> = {
    '$': [], '$$': [], '$$$': [], '$$$$': [], 'null': [],
  };
  for (const r of restaurants) {
    const key = r.budgetLevel ?? 'null';
    if (!buckets[key]) buckets[key] = [];
    buckets[key]!.push(r);
  }
  const labels: Record<string, string> = {
    '$': '$', '$$': '$$', '$$$': '$$$', '$$$$': '$$$$', 'null': '未設定',
  };
  return Object.entries(buckets)
    .filter(([, list]) => list.length > 0)
    .map(([key, list]) => ({ key, label: labels[key] ?? key, restaurants: list }));
}
```

### 7. 資料庫遷移 (`supabase/migrations/`)

現有 `001_create_tables.sql` 的約束為 `budget_level IN ('$', '$$', '$$$')`，不允許 `$$$$`（Requirement 7.1）。

**是否需要新遷移檔**：**需要**新增獨立遷移檔（例如 `002_extend_budget_level.sql`），而非修改 `001`。理由：`001` 已套用於已連結的 Supabase 專案（存在 `supabase/.temp/linked-project.json`），既有遷移應視為不可變歷史；變更約束須以新遷移前滾。

```sql
-- 002_extend_budget_level.sql
ALTER TABLE restaurants
  DROP CONSTRAINT IF EXISTS restaurants_budget_level_check;

ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_budget_level_check
  CHECK (budget_level IS NULL OR budget_level IN ('$', '$$', '$$$', '$$$$'));
```

註：約束名稱以 Postgres 預設命名 `restaurants_budget_level_check` 為準；若實際名稱不同，實作時以 `\d restaurants` 或 `information_schema` 查得的名稱為準。

### 8. `dataService` 對應驗證 (`src/services/dataService.ts`)

`dbToRestaurant` 已將 `row.budget_level` 轉為 `budgetLevel`（型別斷言為 `Restaurant['budgetLevel']`），`restaurantToDb` 已將 `r.budgetLevel` 寫入 `budget_level`。兩者對稱，型別擴充後自動涵蓋 `$$$$`，**無需程式變更**；本功能僅需以 round-trip 測試確認擴充後對應仍正確（見 Property 5）。

## 資料模型 (Data Models)

| App 欄位 (camelCase) | 型別 | DB 欄位 (snake_case) | DB 型別/約束 |
| --- | --- | --- | --- |
| `budgetLevel` | `'$' \| '$$' \| '$$$' \| '$$$$' \| null` | `budget_level` | `TEXT`, `CHECK IN ('$','$$','$$$','$$$$') OR NULL` |
| `avgCost` | `number \| null` (1–99999) | `avg_cost` | `INTEGER`, `CHECK >0 AND <=99999 OR NULL` |

`RestaurantFormData.budgetLevel` 為可選欄位，WISH_LIST 時承載使用者/自動帶入的等級，VISITED 時由 `deriveBudgetLevel(avgCost)` 衍生。

## 錯誤處理 (Error Handling)

- **無價位資料 / 未知列舉**：`priceLevelToBudgetLevel` 對 `null`、未知字串一律回傳 `null`，不拋錯（null-safe），WISH_LIST 表單維持未選狀態（Requirement 2.5、4.4）。
- **avgCost 範圍**：沿用 `validateAvgCost`，超出 1–99999 時於提交/失焦阻擋並顯示錯誤訊息（Requirement 5.3）。
- **卡片 null 呈現**：預算值為 `null` 時不渲染預算區塊，避免顯示空白符號或 `NT$null`（Requirement 6.3）。
- **DB 約束違反**：若舊資料或未遷移環境寫入 `$$$$`，Postgres CHECK 會回傳錯誤；`dataService` 既有 `console.error` 與回傳 `false` 的錯誤路徑會涵蓋，實作須確保遷移已套用。

## 測試策略 (Testing Strategy)

採單元測試與屬性測試互補的雙軌策略（既有測試框架為 Vitest）：

- **屬性測試**：對應函式、分組分割、`avgCost` 範圍驗證、卡片顯示決策、`dataService` round-trip（見下方 Correctness Properties）。每個屬性測試至少 100 次隨機迭代，並標註對應的設計屬性編號。
- **單元/範例測試**：`PlaceSearch` 回呼帶出 `priceLevel`、`ReviewForm` 選取地點後自動帶入等級、WISH_LIST 顯示四級選擇器、VISITED 顯示 `avgCost` 輸入等 UI 具體行為。
- **煙霧/型別驗證**：型別定義（`BudgetLevel`/`BudgetFilter`/`RestaurantFormData.budgetLevel`）由 TypeScript 編譯確保；DB 約束由遷移套用後驗證。

屬性測試標籤格式：**Feature: budget-per-person-display, Property {number}: {property_text}**。

## Correctness Properties

*屬性 (property) 是指在系統所有有效執行下都應成立的特徵或行為，是人類可讀規格與機器可驗證正確性保證之間的橋樑。以下屬性皆以全稱量化 (For all / For any) 表述。*

### Property 1: 有效 Google 價位列舉對應到正確符號

*For any* 屬於已定義四個列舉值之一的 Google_Price_Level 字串（`PRICE_LEVEL_INEXPENSIVE`/`PRICE_LEVEL_MODERATE`/`PRICE_LEVEL_EXPENSIVE`/`PRICE_LEVEL_VERY_EXPENSIVE`），`priceLevelToBudgetLevel` 的回傳值應分別等於 `$`/`$$`/`$$$`/`$$$$`。

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 2: 非法或 null 價位輸入對應為 null

*For any* 為 `null` 或不屬於已定義四個列舉值的字串，`priceLevelToBudgetLevel` 的回傳值應為 `null`。

**Validates: Requirements 2.5**

### Property 3: 依預算等級分組為正確分割

*For any* 餐廳陣列，`groupByBudget` 的結果應使每一間餐廳恰好出現於一個分組中：`budgetLevel` 非 `null` 的餐廳落入其對應等級（`$`/`$$`/`$$$`/`$$$$`）的分組，`budgetLevel` 為 `null` 的餐廳落入「未設定」分組，且所有輸入餐廳皆被涵蓋、無重複、無遺漏。

**Validates: Requirements 1.3, 1.4**

### Property 4: avgCost 驗證的範圍等價性

*For any* 整數值，`validateAvgCost` 通過（valid）當且僅當該值介於 1 至 99999（含）之間；否則應失敗並回傳非空的錯誤訊息。

**Validates: Requirements 5.2, 5.3**

### Property 5: DataService 預算欄位 round-trip 保值

*For any* 有效的 Restaurant 物件，先以 `restaurantToDb` 轉為 DB 列、再以 `dbToRestaurant` 轉回，得到的物件在 `budgetLevel`（及 `avgCost` 等對應欄位）上應與原始物件相等。

**Validates: Requirements 7.2, 7.3**

### Property 6: 餐廳卡片預算顯示規則

*For any* 餐廳，`RestaurantCard` 的預算呈現應滿足：當狀態為 `WISH_LIST` 且 `budgetLevel` 非 `null` 時，輸出包含對應的 `$` 符號等級；當狀態為 `VISITED` 且 `avgCost` 非 `null` 時，輸出包含對應的台幣金額；當對應預算值為 `null` 時，不渲染任何預算區塊。

**Validates: Requirements 6.1, 6.2, 6.3**
